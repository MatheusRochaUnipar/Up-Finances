import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mensagemDeErro } from '../core/api-error';
import { Categoria, Movimentacao } from '../models/models';
import { CategoriaService } from '../services/categoria.service';
import { DataBrPipe } from '../shared/data-br.pipe';

@Component({
  selector: 'app-categoria-movimentacoes',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, DataBrPipe],
  template: `
    <header class="page-header">
      <div>
        <h1>{{ categoria()?.nome ?? 'Categoria' }}</h1>
        <p>
          <a routerLink="/categorias">← Voltar para as categorias</a>
          @if (categoria(); as c) {
            · {{ c.tipo === 'RECEITA' ? 'Receita' : 'Despesa' }}
          }
        </p>
      </div>
      <div class="acoes">
        <a class="btn btn-primary" routerLink="/transacoes/nova">+ Nova movimentação</a>
      </div>
    </header>

    @if (erro()) {
      <div class="erro-form" role="alert">{{ erro() }}</div>
    } @else if (carregando()) {
      <p class="muted">Carregando...</p>
    } @else {
      <section class="cards">
        <div class="card">
          <div class="rotulo">Movimentações</div>
          <div class="valor">{{ movimentacoes().length }}</div>
        </div>
        <div class="card">
          <div class="rotulo">Total da categoria</div>
          <div class="valor" [class.receita]="categoria()?.tipo === 'RECEITA'" [class.despesa]="categoria()?.tipo === 'DESPESA'">
            {{ total() | currency: 'BRL' }}
          </div>
        </div>
      </section>

      <div class="card">
        <div class="tabela-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th class="num">Valor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (m of movimentacoes(); track m.id) {
                <tr>
                  <td>{{ m.data | dataBr }}</td>
                  <td>{{ m.descricao }}</td>
                  <td class="num">{{ m.valor | currency: 'BRL' }}</td>
                  <td class="acoes-col">
                    <a class="btn btn-ghost btn-sm" [routerLink]="['/transacoes', m.id]">Ver</a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="vazio">Nenhuma movimentação nesta categoria.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class CategoriaMovimentacoesComponent implements OnInit {
  private readonly rota = inject(ActivatedRoute);
  private readonly service = inject(CategoriaService);

  protected readonly categoria = signal<Categoria | null>(null);
  protected readonly movimentacoes = signal<Movimentacao[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected total(): number {
    return this.movimentacoes().reduce((soma, m) => soma + m.valor, 0);
  }

  ngOnInit(): void {
    const id = Number(this.rota.snapshot.paramMap.get('id'));
    if (Number.isNaN(id)) {
      this.erro.set('Categoria inválida.');
      this.carregando.set(false);
      return;
    }
    forkJoin({
      categoria: this.service.buscar(id),
      movimentacoes: this.service.movimentacoesDaCategoria(id),
    }).subscribe({
      next: ({ categoria, movimentacoes }) => {
        this.categoria.set(categoria);
        this.movimentacoes.set(movimentacoes);
        this.carregando.set(false);
      },
      error: (e: unknown) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }
}
