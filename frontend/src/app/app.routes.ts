import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cadastro',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/cadastro.component').then((m) => m.CadastroComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'painel' },
      {
        path: 'painel',
        loadComponent: () => import('./pages/painel.component').then((m) => m.PainelComponent),
      },
      {
        path: 'transacoes',
        loadComponent: () =>
          import('./pages/transacoes-lista.component').then((m) => m.TransacoesListaComponent),
      },
      {
        path: 'transacoes/nova',
        loadComponent: () =>
          import('./pages/transacao-form.component').then((m) => m.TransacaoFormComponent),
      },
      {
        path: 'transacoes/:id/editar',
        loadComponent: () =>
          import('./pages/transacao-form.component').then((m) => m.TransacaoFormComponent),
      },
      {
        path: 'transacoes/:id',
        loadComponent: () =>
          import('./pages/transacao-detalhe.component').then((m) => m.TransacaoDetalheComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./pages/categorias-lista.component').then((m) => m.CategoriasListaComponent),
      },
      {
        path: 'categorias/:id',
        loadComponent: () =>
          import('./pages/categoria-movimentacoes.component').then(
            (m) => m.CategoriaMovimentacoesComponent,
          ),
      },
      {
        path: 'relatorios',
        loadComponent: () =>
          import('./pages/relatorios.component').then((m) => m.RelatoriosComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
