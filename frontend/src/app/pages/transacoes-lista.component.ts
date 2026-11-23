import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemDeErro } from '../core/api-error';
import { NotificationService } from '../core/notification.service';
import { FiltroMovimentacao, Movimentacao, TipoMovimentacao } from '../models/models';
import { MovimentacaoService } from '../services/movimentacao.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { DataBrPipe } from '../shared/data-br.pipe';

@Component({
  selector: 'app-transacoes-lista',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DataBrPipe, ConfirmDialogComponent],
  template: `
    <header class="page-header">
      <div>
        <h1>Transações</h1>
        <p>Extrato com busca por vários filtros</p>
      </div>
      <div class="acoes">
        <a class="btn btn-primary" routerLink="/transacoes/nova">+ Nova movimentação</a>
      </div>
    </header>

    <form class="card form" [formGroup]="filtro" (ngSubmit)="buscar()" novalidate>
      <div class="form-grid">
        <div class="field">
          <label for="f-tipo">Tipo</label>
          <select id="f-tipo" class="input" formControlName="tipo">
            <option value="">Todos</option>
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
          </select>
        </div>
        <div class="field">
          <label for="f-desc">Descrição contém</label>
          <input id="f-desc" class="input" type="text" formControlName="descricao" />
        </div>
        <div class="field">
          <label for="f-ini">Data inicial</label>
          <input id="f-ini" class="input" type="date" formControlName="dataInicio" />
        </div>
        <div class="field">
          <label for="f-fim">Data final</label>
          <input id="f-fim" class="input" type="date" formControlName="dataFim" />
        </div>
        <div class="field">
          <label for="f-min">Valor mínimo</label>
          <input id="f-min" class="input" type="number" step="0.01" min="0" formControlName="valorMin" />
        </div>
        <div class="field">
          <label for="f-max">Valor máximo</label>
          <input id="f-max" class="input" type="number" step="0.01" min="0" formControlName="valorMax" />
        </div>
      </div>
      @if (erroFiltro()) {
        <span class="erro-campo">{{ erroFiltro() }}</span>
      }
      <div class="acoes">
        <button type="submit" class="btn btn-primary" [disabled]="carregando()">Buscar</button>
        <button type="button" class="btn btn-ghost" (click)="limpar()">Limpar filtros</button>
      </div>
    </form>

    <div class="card" style="margin-top: 14px">
      @if (erro()) {
        <div class="erro-form" role="alert">{{ erro() }}</div>
      } @else if (carregando()) {
        <p class="muted">Carregando...</p>
      } @else {
        <div class="tabela-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th class="num">Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (m of movimentacoes(); track m.id) {
                <tr>
                  <td>{{ m.data | dataBr }}</td>
                  <td>{{ m.descricao }}</td>
                  <td><a [routerLink]="['/categorias', m.categoriaId]">{{ m.categoriaNome }}</a></td>
                  <td>
                    <span class="badge" [class.badge-receita]="m.tipo === 'RECEITA'" [class.badge-despesa]="m.tipo === 'DESPESA'">
                      {{ m.tipo === 'RECEITA' ? 'Receita' : 'Despesa' }}
                    </span>
                  </td>
                  <td class="num" [class.receita]="m.tipo === 'RECEITA'" [class.despesa]="m.tipo === 'DESPESA'">
                    {{ m.tipo === 'DESPESA' ? '-' : '+' }}{{ m.valor | currency: 'BRL' }}
                  </td>
                  <td class="acoes-col">
                    <a class="btn btn-ghost btn-sm" [routerLink]="['/transacoes', m.id]">Ver</a>
                    <a class="btn btn-ghost btn-sm" [routerLink]="['/transacoes', m.id, 'editar']">Editar</a>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="pedirExclusao(m)">Excluir</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="vazio">Nenhuma movimentação encontrada para os filtros selecionados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (excluindo(); as alvo) {
      <app-confirm-dialog
        titulo="Excluir transação?"
        mensagem="Esta ação é permanente e não poderá ser desfeita."
        [resumo]="alvo.descricao + ' — ' + (alvo.valor | currency: 'BRL')"
        [processando]="processandoExclusao()"
        (confirmar)="excluir(alvo)"
        (cancelar)="excluindo.set(null)"
      />
    }
  `,
})
export class TransacoesListaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MovimentacaoService);
  private readonly avisos = inject(NotificationService);

  protected readonly movimentacoes = signal<Movimentacao[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly erroFiltro = signal<string | null>(null);
  protected readonly excluindo = signal<Movimentacao | null>(null);
  protected readonly processandoExclusao = signal(false);

  protected readonly filtro = this.fb.nonNullable.group({
    tipo: '' as TipoMovimentacao | '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    valorMin: null as number | null,
    valorMax: null as number | null,
  });

  ngOnInit(): void {
    this.buscar();
  }

  protected buscar(): void {
    const f = this.filtro.getRawValue();
    this.erroFiltro.set(null);

    if (f.dataInicio && f.dataFim && f.dataInicio > f.dataFim) {
      this.erroFiltro.set('A data inicial não pode ser posterior à data final.');
      return;
    }
    if (f.valorMin !== null && f.valorMax !== null && f.valorMin > f.valorMax) {
      this.erroFiltro.set('O valor mínimo não pode ser maior que o valor máximo.');
      return;
    }

    const filtro: FiltroMovimentacao = {
      tipo: f.tipo,
      descricao: f.descricao.trim(),
      dataInicio: f.dataInicio,
      dataFim: f.dataFim,
      valorMin: f.valorMin,
      valorMax: f.valorMax,
    };

    this.carregando.set(true);
    this.erro.set(null);
    this.service.listar(filtro).subscribe({
      next: (lista) => {
        this.movimentacoes.set(lista);
        this.carregando.set(false);
      },
      error: (e: unknown) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }

  protected limpar(): void {
    this.filtro.reset();
    this.buscar();
  }

  protected pedirExclusao(m: Movimentacao): void {
    this.excluindo.set(m);
  }

  protected excluir(m: Movimentacao): void {
    this.processandoExclusao.set(true);
    this.service.excluir(m.id).subscribe({
      next: () => {
        this.processandoExclusao.set(false);
        this.excluindo.set(null);
        this.avisos.sucesso('Movimentação excluída com sucesso.');
        this.buscar();
      },
      error: (e: unknown) => {
        this.processandoExclusao.set(false);
        this.excluindo.set(null);
        this.avisos.erro(mensagemDeErro(e));
      },
    });
  }
}
