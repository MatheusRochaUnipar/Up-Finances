import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { mensagemDeErro } from '../core/api-error';
import { Movimentacao } from '../models/models';
import { MovimentacaoService } from '../services/movimentacao.service';
import { mesAtual, primeiroDia, ultimoDia } from '../shared/datas';

interface GastoCategoria {
  nome: string;
  total: number;
  percentualDasDespesas: number;
  percentualDaReceita: number | null;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DecimalPipe],
  template: `
    <header class="page-header">
      <div>
        <h1>Relatórios</h1>
        <p>Receitas x despesas e gastos por categoria</p>
      </div>
      <div class="field">
        <label for="mes">Mês</label>
        <input id="mes" class="input" type="month" [ngModel]="mes()" (ngModelChange)="trocarMes($event)" />
      </div>
    </header>

    @if (erro()) {
      <div class="erro-form" role="alert">{{ erro() }}</div>
    } @else if (carregando()) {
      <p class="muted">Carregando...</p>
    } @else {
      <section class="cards">
        <div class="card">
          <div class="rotulo">Receitas</div>
          <div class="valor receita">{{ receitas() | currency: 'BRL' }}</div>
        </div>
        <div class="card">
          <div class="rotulo">Despesas</div>
          <div class="valor despesa">{{ despesas() | currency: 'BRL' }}</div>
        </div>
        <div class="card">
          <div class="rotulo">Resultado do mês</div>
          <div class="valor" [class.receita]="receitas() - despesas() >= 0" [class.despesa]="receitas() - despesas() < 0">
            {{ receitas() - despesas() | currency: 'BRL' }}
          </div>
        </div>
      </section>

      <section class="duas-colunas">
        <div class="card">
          <h2>Receitas x despesas</h2>
          <div class="linha-barra">
            <div class="topo"><span>Receitas</span><span class="muted">{{ receitas() | currency: 'BRL' }}</span></div>
            <div class="barra"><span [style.width.%]="larguraBarra(receitas())"></span></div>
          </div>
          <div class="linha-barra">
            <div class="topo"><span>Despesas</span><span class="muted">{{ despesas() | currency: 'BRL' }}</span></div>
            <div class="barra vermelha"><span [style.width.%]="larguraBarra(despesas())"></span></div>
          </div>
        </div>

        <div class="card">
          <h2>Gastos por categoria</h2>
          @for (g of gastos(); track g.nome) {
            <div class="linha-barra">
              <div class="topo">
                <span>{{ g.nome }}</span>
                <span class="muted">
                  {{ g.total | currency: 'BRL' }}
                  @if (g.percentualDaReceita !== null) {
                    · {{ g.percentualDaReceita | number: '1.0-1' }}% da receita
                  }
                </span>
              </div>
              <div class="barra vermelha"><span [style.width.%]="g.percentualDasDespesas"></span></div>
            </div>
          } @empty {
            <p class="muted">Nenhuma movimentação encontrada para o período selecionado.</p>
          }
        </div>
      </section>
    }
  `,
})
export class RelatoriosComponent implements OnInit {
  private readonly service = inject(MovimentacaoService);

  protected readonly mes = signal(mesAtual());
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly receitas = signal(0);
  protected readonly despesas = signal(0);
  protected readonly gastos = signal<GastoCategoria[]>([]);

  ngOnInit(): void {
    this.carregar();
  }

  protected trocarMes(valor: string): void {
    if (!valor) {
      return;
    }
    this.mes.set(valor);
    this.carregar();
  }

  protected larguraBarra(valor: number): number {
    const maior = Math.max(this.receitas(), this.despesas());
    return maior > 0 ? (valor / maior) * 100 : 0;
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    const mes = this.mes();
    this.service.listar({ dataInicio: primeiroDia(mes), dataFim: ultimoDia(mes) }).subscribe({
      next: (lista) => {
        this.calcular(lista);
        this.carregando.set(false);
      },
      error: (e: unknown) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }

  private calcular(lista: Movimentacao[]): void {
    let receitas = 0;
    let despesas = 0;
    const porCategoria = new Map<string, number>();

    for (const m of lista) {
      if (m.tipo === 'RECEITA') {
        receitas += m.valor;
      } else {
        despesas += m.valor;
        porCategoria.set(m.categoriaNome, (porCategoria.get(m.categoriaNome) ?? 0) + m.valor);
      }
    }

    this.receitas.set(receitas);
    this.despesas.set(despesas);
    this.gastos.set(
      [...porCategoria.entries()]
        .map(([nome, total]) => ({
          nome,
          total,
          percentualDasDespesas: despesas > 0 ? (total / despesas) * 100 : 0,
          percentualDaReceita: receitas > 0 ? (total / receitas) * 100 : null,
        }))
        .sort((a, b) => b.total - a.total),
    );
  }
}
