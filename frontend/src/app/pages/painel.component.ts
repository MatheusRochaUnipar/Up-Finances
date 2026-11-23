import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemDeErro } from '../core/api-error';
import { Movimentacao } from '../models/models';
import { MovimentacaoService } from '../services/movimentacao.service';
import { DataBrPipe } from '../shared/data-br.pipe';

interface GastoCategoria {
  nome: string;
  total: number;
  percentual: number;
}

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, DataBrPipe],
  template: `
    <header class="page-header">
      <div>
        <h1>Painel</h1>
        <p>Visão geral das suas finanças</p>
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
          <div class="rotulo">Saldo atual</div>
          <div class="valor" [class.despesa]="saldo() < 0" [class.receita]="saldo() >= 0">
            {{ saldo() | currency: 'BRL' }}
          </div>
        </div>
        <div class="card">
          <div class="rotulo">Receitas do mês</div>
          <div class="valor receita">{{ receitasMes() | currency: 'BRL' }}</div>
        </div>
        <div class="card">
          <div class="rotulo">Despesas do mês</div>
          <div class="valor despesa">{{ despesasMes() | currency: 'BRL' }}</div>
        </div>
      </section>

      <section class="duas-colunas">
        <div class="card">
          <h2>Gastos por categoria (mês)</h2>
          @for (g of gastos(); track g.nome) {
            <div class="linha-barra">
              <div class="topo">
                <span>{{ g.nome }}</span>
                <span class="muted">{{ g.total | currency: 'BRL' }}</span>
              </div>
              <div class="barra vermelha"><span [style.width.%]="g.percentual"></span></div>
            </div>
          } @empty {
            <p class="muted">Nenhuma despesa registrada neste mês.</p>
          }
        </div>

        <div class="card">
          <h2>Movimentações recentes</h2>
          <ul class="lista">
            @for (m of recentes(); track m.id) {
              <li>
                <div>
                  <a [routerLink]="['/transacoes', m.id]">{{ m.descricao }}</a>
                  <div class="muted">{{ m.categoriaNome }} · {{ m.data | dataBr }}</div>
                </div>
                <strong [class.receita]="m.tipo === 'RECEITA'" [class.despesa]="m.tipo === 'DESPESA'">
                  {{ m.tipo === 'DESPESA' ? '-' : '+' }}{{ m.valor | currency: 'BRL' }}
                </strong>
              </li>
            } @empty {
              <li class="muted">Nenhuma movimentação ainda.</li>
            }
          </ul>
        </div>
      </section>
    }
  `,
})
export class PainelComponent implements OnInit {
  private readonly service = inject(MovimentacaoService);

  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly saldo = signal(0);
  protected readonly receitasMes = signal(0);
  protected readonly despesasMes = signal(0);
  protected readonly gastos = signal<GastoCategoria[]>([]);
  protected readonly recentes = signal<Movimentacao[]>([]);

  ngOnInit(): void {
    this.service.listar().subscribe({
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
    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

    let receitas = 0;
    let despesas = 0;
    let receitasDoMes = 0;
    let despesasDoMes = 0;
    const porCategoria = new Map<string, number>();

    for (const m of lista) {
      const doMes = m.data.startsWith(mesAtual);
      if (m.tipo === 'RECEITA') {
        receitas += m.valor;
        if (doMes) {
          receitasDoMes += m.valor;
        }
      } else {
        despesas += m.valor;
        if (doMes) {
          despesasDoMes += m.valor;
          porCategoria.set(m.categoriaNome, (porCategoria.get(m.categoriaNome) ?? 0) + m.valor);
        }
      }
    }

    this.saldo.set(receitas - despesas);
    this.receitasMes.set(receitasDoMes);
    this.despesasMes.set(despesasDoMes);

    const maior = Math.max(0, ...porCategoria.values());
    this.gastos.set(
      [...porCategoria.entries()]
        .map(([nome, total]) => ({ nome, total, percentual: maior > 0 ? (total / maior) * 100 : 0 }))
        .sort((a, b) => b.total - a.total),
    );
    this.recentes.set(lista.slice(0, 6)); 
  }
}
