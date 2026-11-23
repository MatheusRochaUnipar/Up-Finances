import { Injectable, signal } from '@angular/core';

export type TipoAviso = 'sucesso' | 'erro' | 'info';

export interface Aviso {
  id: number;
  tipo: TipoAviso;
  texto: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private proximoId = 1;
  readonly avisos = signal<Aviso[]>([]);

  sucesso(texto: string): void {
    this.adicionar('sucesso', texto);
  }

  erro(texto: string): void {
    this.adicionar('erro', texto, 7000);
  }

  info(texto: string): void {
    this.adicionar('info', texto);
  }

  fechar(id: number): void {
    this.avisos.update((lista) => lista.filter((a) => a.id !== id));
  }

  private adicionar(tipo: TipoAviso, texto: string, duracaoMs = 4500): void {
    const id = this.proximoId++;
    this.avisos.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.fechar(id), duracaoMs);
  }
}
