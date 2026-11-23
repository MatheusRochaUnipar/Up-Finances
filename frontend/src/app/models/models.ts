export type Perfil = 'ADMIN' | 'COMUM';
export type TipoMovimentacao = 'RECEITA' | 'DESPESA';

export interface Categoria {
  id: number;
  nome: string;
  tipo: TipoMovimentacao;
}

export interface CategoriaRequest {
  nome: string;
  tipo: TipoMovimentacao;
}

export interface Movimentacao {
  id: number;
  descricao: string;
  valor: number;
  data: string; 
  tipo: TipoMovimentacao;
  categoriaId: number;
  categoriaNome: string;
  usuarioId: number;
}

export interface MovimentacaoRequest {
  descricao: string;
  valor: number;
  data: string;
  categoriaId: number;
}

export interface FiltroMovimentacao {
  tipo?: TipoMovimentacao | '';
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
  valorMin?: number | null;
  valorMax?: number | null;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuarioId: number;
  nome: string;
  perfil: Perfil;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface Sessao {
  token: string;
  usuarioId: number;
  nome: string;
  perfil: Perfil;
}

export interface ApiErro {
  status: number;
  erro: string;
  mensagem: string;
  timestamp?: string;
  detalhes?: string[];
}
