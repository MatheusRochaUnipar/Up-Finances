import { HttpErrorResponse } from '@angular/common/http';
import { ApiErro } from '../models/models';

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique se a API está no ar.';
    }
    const corpo = erro.error as ApiErro | null;
    if (corpo && typeof corpo === 'object') {
      if (corpo.detalhes && corpo.detalhes.length > 0) {
        return corpo.detalhes.join(' · ');
      }
      if (corpo.mensagem) {
        return corpo.mensagem;
      }
    }
    switch (erro.status) {
      case 400:
        return 'Dados inválidos. Confira os campos e tente novamente.';
      case 401:
        return 'Sessão expirada ou credenciais inválidas. Faça login novamente.';
      case 403:
        return 'Acesso negado para o seu perfil.';
      case 404:
        return 'Registro não encontrado.';
      case 409:
        return 'Operação não permitida: conflito com outros dados.';
    }
  }
  return 'Não foi possível concluir a operação. Tente novamente.';
}

export function statusDoErro(erro: unknown): number {
  return erro instanceof HttpErrorResponse ? erro.status : 0;
}
