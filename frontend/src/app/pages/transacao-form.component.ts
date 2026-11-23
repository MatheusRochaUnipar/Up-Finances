import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { mensagemDeErro } from '../core/api-error';
import { NotificationService } from '../core/notification.service';
import { Categoria, Movimentacao, TipoMovimentacao } from '../models/models';
import { CategoriaService } from '../services/categoria.service';
import { MovimentacaoService } from '../services/movimentacao.service';
import { hojeIso } from '../shared/datas';

@Component({
  selector: 'app-transacao-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <header class="page-header">
      <div>
        <h1>{{ id() ? 'Editar movimentação' : 'Nova movimentação' }}</h1>
        <p>Informe valor, descrição, categoria e data</p>
      </div>
    </header>

    @if (carregando()) {
      <p class="muted">Carregando...</p>
    } @else if (erroCarga()) {
      <div class="erro-form" role="alert">{{ erroCarga() }}</div>
      <p><a routerLink="/transacoes">Voltar para as transações</a></p>
    } @else {
      <form class="card form form-card" [formGroup]="form" (ngSubmit)="salvar()" novalidate>
        @if (erroEnvio()) {
          <div class="erro-form" role="alert">{{ erroEnvio() }}</div>
        }

        <div class="field">
          <label for="categoria">Categoria</label>
          <select id="categoria" class="input" formControlName="categoriaId"
                  [class.invalido]="invalido('categoriaId')">
            <option [ngValue]="null">Selecione uma categoria</option>
            <optgroup label="Despesas">
              @for (c of categoriasDe('DESPESA'); track c.id) {
                <option [ngValue]="c.id">{{ c.nome }}</option>
              }
            </optgroup>
            <optgroup label="Receitas">
              @for (c of categoriasDe('RECEITA'); track c.id) {
                <option [ngValue]="c.id">{{ c.nome }}</option>
              }
            </optgroup>
          </select>
          @if (invalido('categoriaId')) {
            <span class="erro-campo">A categoria é obrigatória.</span>
          } @else {
            @if (tipoEscolhido(); as t) {
              <span class="dica">Tipo definido pela categoria: {{ t === 'RECEITA' ? 'receita' : 'despesa' }}.</span>
            }
          }
        </div>

        <div class="field">
          <label for="descricao">Descrição</label>
          <input id="descricao" class="input" type="text" formControlName="descricao"
                 [class.invalido]="invalido('descricao')" />
          @if (invalido('descricao')) {
            <span class="erro-campo">A descrição é obrigatória.</span>
          }
        </div>

        <div class="field">
          <label for="valor">Valor (R$)</label>
          <input id="valor" class="input" type="number" step="0.01" min="0" formControlName="valor"
                 [class.invalido]="invalido('valor')" />
          @if (invalido('valor')) {
            <span class="erro-campo">O valor deve ser maior que zero.</span>
          }
        </div>

        <div class="field">
          <label for="data">Data</label>
          <input id="data" class="input" type="date" formControlName="data"
                 [class.invalido]="invalido('data')" />
          @if (invalido('data')) {
            <span class="erro-campo">A data é obrigatória.</span>
          }
        </div>

        <div class="acoes">
          <button type="submit" class="btn btn-primary" [disabled]="enviando()">
            {{ enviando() ? 'Salvando...' : id() ? 'Salvar alterações' : 'Adicionar movimentação' }}
          </button>
          <a class="btn btn-ghost" routerLink="/transacoes">Cancelar</a>
        </div>
      </form>
    }
  `,
})
export class TransacaoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rota = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly movimentacoes = inject(MovimentacaoService);
  private readonly categoriasApi = inject(CategoriaService);
  private readonly avisos = inject(NotificationService);

  protected readonly id = signal<number | null>(null);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly carregando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly erroCarga = signal<string | null>(null);
  protected readonly erroEnvio = signal<string | null>(null);

  protected readonly form = this.fb.group({
    categoriaId: this.fb.control<number | null>(null, Validators.required),
    descricao: this.fb.nonNullable.control('', Validators.required),
    valor: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    data: this.fb.nonNullable.control(hojeIso(), Validators.required),
  });

  ngOnInit(): void {
    const param = this.rota.snapshot.paramMap.get('id');
    const idEdicao = param !== null ? Number(param) : null;
    if (idEdicao !== null && Number.isNaN(idEdicao)) {
      this.erroCarga.set('Movimentação inválida.');
      this.carregando.set(false);
      return;
    }
    this.id.set(idEdicao);

    const movimentacao$: Observable<Movimentacao | null> =
      idEdicao !== null ? this.movimentacoes.buscar(idEdicao) : of(null);

    forkJoin({
      categorias: this.categoriasApi.listar(),
      movimentacao: movimentacao$,
    }).subscribe({
      next: ({ categorias, movimentacao }) => {
        this.categorias.set(categorias);
        if (movimentacao) {
          this.form.patchValue({
            categoriaId: movimentacao.categoriaId,
            descricao: movimentacao.descricao,
            valor: movimentacao.valor,
            data: movimentacao.data,
          });
        }
        this.carregando.set(false);
      },
      error: (e: unknown) => {
        this.erroCarga.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }

  protected categoriasDe(tipo: TipoMovimentacao): Categoria[] {
    return this.categorias().filter((c) => c.tipo === tipo);
  }

  protected tipoEscolhido(): TipoMovimentacao | null {
    const escolhida = this.form.controls.categoriaId.value;
    return this.categorias().find((c) => c.id === escolhida)?.tipo ?? null;
  }

  protected invalido(campo: 'categoriaId' | 'descricao' | 'valor' | 'data'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (v.categoriaId === null || v.valor === null) {
      return;
    }
    const dados = {
      descricao: v.descricao.trim(),
      valor: v.valor,
      data: v.data,
      categoriaId: v.categoriaId,
    };

    this.erroEnvio.set(null);
    this.enviando.set(true);
    const id = this.id();
    const chamada = id !== null ? this.movimentacoes.atualizar(id, dados) : this.movimentacoes.criar(dados);
    chamada.subscribe({
      next: () => {
        this.enviando.set(false);
        this.avisos.sucesso(id !== null ? 'Alterações salvas com sucesso.' : 'Movimentação registrada com sucesso.');
        this.router.navigate(['/transacoes']);
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.erroEnvio.set(mensagemDeErro(e));
      },
    });
  }
}
