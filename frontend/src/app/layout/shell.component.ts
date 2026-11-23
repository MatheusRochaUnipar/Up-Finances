import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-dot"></span> Up Finances</div>
        <nav>
          <a routerLink="/painel" routerLinkActive="ativo" class="nav-link">Painel</a>
          <a routerLink="/transacoes" routerLinkActive="ativo" class="nav-link">Transações</a>
          <a routerLink="/categorias" routerLinkActive="ativo" class="nav-link">Categorias</a>
          <a routerLink="/relatorios" routerLinkActive="ativo" class="nav-link">Relatórios</a>
        </nav>
        <div class="sidebar-footer">
          @if (auth.sessao(); as s) {
            <div class="usuario">
              <strong>{{ s.nome }}</strong>
              <span class="badge" [class.badge-admin]="s.perfil === 'ADMIN'">{{ s.perfil }}</span>
            </div>
          }
          <button type="button" class="btn btn-ghost btn-block" (click)="auth.logout()">Sair</button>
        </div>
      </aside>
      <main class="conteudo">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
}
