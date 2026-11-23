import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { FiltroMovimentacao, Movimentacao, MovimentacaoRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MovimentacaoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/movimentacoes`;

  listar(filtro: FiltroMovimentacao = {}): Observable<Movimentacao[]> {
    let params = new HttpParams();
    for (const [nome, valor] of Object.entries(filtro)) {
      if (valor !== null && valor !== undefined && valor !== '') {
        params = params.set(nome, String(valor));
      }
    }
    return this.http.get<Movimentacao[]>(this.url, { params });
  }

  buscar(id: number): Observable<Movimentacao> {
    return this.http.get<Movimentacao>(`${this.url}/${id}`);
  }

  criar(dados: MovimentacaoRequest): Observable<Movimentacao> {
    return this.http.post<Movimentacao>(this.url, dados);
  }

  atualizar(id: number, dados: MovimentacaoRequest): Observable<Movimentacao> {
    return this.http.put<Movimentacao>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
