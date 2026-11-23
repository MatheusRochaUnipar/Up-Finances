import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse, Sessao, Usuario } from '../models/models';
import { API_URL } from './api.config';

const CHAVE_SESSAO = 'upfinances.sessao';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly estado = signal<Sessao | null>(this.lerSessao());

  readonly sessao = this.estado.asReadonly();
  readonly logado = computed(() => this.estado() !== null);
  readonly admin = computed(() => this.estado()?.perfil === 'ADMIN');

  get token(): string | null {
    return this.estado()?.token ?? null;
  }

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { email, senha }).pipe(
      tap((resposta) =>
        this.guardarSessao({
          token: resposta.token,
          usuarioId: resposta.usuarioId,
          nome: resposta.nome,
          perfil: resposta.perfil,
        }),
      ),
    );
  }

  registrar(nome: string, email: string, senha: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${API_URL}/auth/registro`, { nome, email, senha });
  }

  logout(): void {
    this.estado.set(null);
    try {
      localStorage.removeItem(CHAVE_SESSAO);
    } catch {
    }
    this.router.navigate(['/login']);
  }

  private guardarSessao(sessao: Sessao): void {
    this.estado.set(sessao);
    try {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    } catch {
    }
  }

  private lerSessao(): Sessao | null {
    try {
      const bruto = localStorage.getItem(CHAVE_SESSAO);
      if (!bruto) {
        return null;
      }
      const sessao = JSON.parse(bruto) as Sessao;
      return sessao && sessao.token ? sessao : null;
    } catch {
      return null;
    }
  }
}
