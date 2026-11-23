import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { Categoria, CategoriaRequest, Movimentacao } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/categorias`;

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.url);
  }

  buscar(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.url}/${id}`);
  }

  criar(dados: CategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(this.url, dados);
  }

  atualizar(id: number, dados: CategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  movimentacoesDaCategoria(id: number): Observable<Movimentacao[]> {
    return this.http.get<Movimentacao[]>(`${this.url}/${id}/movimentacoes`);
  }
}
