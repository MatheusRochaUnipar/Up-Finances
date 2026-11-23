import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemDeErro } from '../core/api-error';
import { AuthService } from '../core/auth.service';
import { NotificationService } from '../core/notification.service';
import { Categoria, TipoMovimentacao } from '../models/models';
import { CategoriaService } from '../services/categoria.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-categorias-lista',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ConfirmDialogComponent],
  template: `
    <header class="page-header">
      <div>
        <h1>Categorias</h1>
        <p>
          Categorias de despesas e de receitas
          @if (!auth.admin()) {
            · somente administradores podem alterá-las
          }
        </p>
      </div>
      @if (auth.admin()) {
        <div class="acoes">
          <button type="button" class="btn btn-primary" (click)="abrirNova()">+ Nova categoria</button>
        </div>
      }
    </header>

    @if (erro()) {
      <div class="erro-form" role="alert">{{ erro() }}</div>
    } @else if (carregando()) {
      <p class="muted">Carregando...</p>
    } @else {
      <section class="duas-colunas">
        <div class="card">
          <h2>Despesas</h2>
          <ul class="lista">
            @for (c of categoriasDe('DESPESA'); track c.id) {
              <li>
                <a [routerLink]="['/categorias', c.id]">{{ c.nome }}</a>
                @if (auth.admin()) {
                  <span class="acoes">
                    <button type="button" class="btn btn-ghost btn-sm" (click)="abrirEdicao(c)">Editar</button>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="excluindo.set(c)">Excluir</button>
                  </span>
                }
              </li>
            } @empty {
              <li class="muted">Nenhuma categoria de despesa.</li>
            }
          </ul>
        </div>

        <div class="card">
          <h2>Receitas</h2>
          <ul class="lista">
            @for (c of categoriasDe('RECEITA'); track c.id) {
              <li>
                <a [routerLink]="['/categorias', c.id]">{{ c.nome }}</a>
                @if (auth.admin()) {
                  <span class="acoes">
                    <button type="button" class="btn btn-ghost btn-sm" (click)="abrirEdicao(c)">Editar</button>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="excluindo.set(c)">Excluir</button>
                  </span>
                }
              </li>
            } @empty {
              <li class="muted">Nenhuma categoria de receita.</li>
            }
          </ul>
        </div>
      </section>
    }

    @if (formAberto()) {
      <div class="modal-backdrop" (click)="fecharForm()">
        <form class="modal form" [formGroup]="form" (ngSubmit)="salvar()" (click)="$event.stopPropagation()" novalidate>
          <h2>{{ editando() ? 'Editar categoria' : 'Nova categoria' }}</h2>

          @if (erroForm()) {
            <div class="erro-form" role="alert">{{ erroForm() }}</div>
          }

          <div class="field">
            <label for="cat-nome">Nome</label>
            <input id="cat-nome" class="input" type="text" formControlName="nome"
                   [class.invalido]="nomeInvalido()" />
            @if (nomeInvalido()) {
              <span class="erro-campo">O nome da categoria é obrigatório.</span>
            }
          </div>

          <div class="field">
            <label for="cat-tipo">Tipo</label>
            <select id="cat-tipo" class="input" formControlName="tipo">
              <option value="DESPESA">Despesa</option>
              <option value="RECEITA">Receita</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" (click)="fecharForm()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="enviando()">
              {{ enviando() ? 'Salvando...' : editando() ? 'Salvar alterações' : 'Criar categoria' }}
            </button>
          </div>
        </form>
      </div>
    }

    @if (excluindo(); as alvo) {
      <app-confirm-dialog
        titulo="Excluir categoria?"
        mensagem="Esta ação é permanente. Categorias com movimentações não podem ser excluídas."
        [resumo]="alvo.nome"
        [processando]="processandoExclusao()"
        (confirmar)="excluir(alvo)"
        (cancelar)="excluindo.set(null)"
      />
    }
  `,
})
export class CategoriasListaComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CategoriaService);
  private readonly avisos = inject(NotificationService);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly formAberto = signal(false);
  protected readonly editando = signal<Categoria | null>(null);
  protected readonly enviando = signal(false);
  protected readonly erroForm = signal<string | null>(null);

  protected readonly excluindo = signal<Categoria | null>(null);
  protected readonly processandoExclusao = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    tipo: 'DESPESA' as TipoMovimentacao,
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected categoriasDe(tipo: TipoMovimentacao): Categoria[] {
    return this.categorias().filter((c) => c.tipo === tipo);
  }

  protected nomeInvalido(): boolean {
    const c = this.form.controls.nome;
    return c.invalid && (c.touched || c.dirty);
  }

  private carregar(): void {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: (lista) => {
        this.categorias.set(lista);
        this.carregando.set(false);
      },
      error: (e: unknown) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }

  protected abrirNova(): void {
    this.editando.set(null);
    this.form.reset({ nome: '', tipo: 'DESPESA' });
    this.erroForm.set(null);
    this.formAberto.set(true);
  }

  protected abrirEdicao(c: Categoria): void {
    this.editando.set(c);
    this.form.reset({ nome: c.nome, tipo: c.tipo });
    this.erroForm.set(null);
    this.formAberto.set(true);
  }

  protected fecharForm(): void {
    this.formAberto.set(false);
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nome, tipo } = this.form.getRawValue();
    const dados = { nome: nome.trim(), tipo };
    const atual = this.editando();

    this.erroForm.set(null);
    this.enviando.set(true);
    const chamada = atual ? this.service.atualizar(atual.id, dados) : this.service.criar(dados);
    chamada.subscribe({
      next: () => {
        this.enviando.set(false);
        this.formAberto.set(false);
        this.avisos.sucesso(atual ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.');
        this.carregar();
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.erroForm.set(mensagemDeErro(e));
      },
    });
  }

  protected excluir(c: Categoria): void {
    this.processandoExclusao.set(true);
    this.service.excluir(c.id).subscribe({
      next: () => {
        this.processandoExclusao.set(false);
        this.excluindo.set(null);
        this.avisos.sucesso('Categoria excluída com sucesso.');
        this.carregar();
      },
      error: (e: unknown) => {
        this.processandoExclusao.set(false);
        this.excluindo.set(null);
        this.avisos.erro(mensagemDeErro(e));
      },
    });
  }
}
