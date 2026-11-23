import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { mensagemDeErro } from '../core/api-error';
import { NotificationService } from '../core/notification.service';
import { Movimentacao } from '../models/models';
import { MovimentacaoService } from '../services/movimentacao.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { DataBrPipe } from '../shared/data-br.pipe';

@Component({
  selector: 'app-transacao-detalhe',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, DataBrPipe, ConfirmDialogComponent],
  template: `
    <header class="page-header">
      <div>
        <h1>Detalhes da movimentação</h1>
        <p><a routerLink="/transacoes">← Voltar para as transações</a></p>
      </div>
      @if (mov(); as m) {
        <div class="acoes">
          <a class="btn btn-ghost" [routerLink]="['/transacoes', m.id, 'editar']">Editar</a>
          <button type="button" class="btn btn-danger" (click)="confirmando.set(true)">Excluir</button>
        </div>
      }
    </header>

    @if (mov(); as m) {
      <div class="card form-card">
        <dl class="detalhes">
          <dt>Descrição</dt>
          <dd>{{ m.descricao }}</dd>
          <dt>Valor</dt>
          <dd [class.receita]="m.tipo === 'RECEITA'" [class.despesa]="m.tipo === 'DESPESA'">
            <strong>{{ m.valor | currency: 'BRL' }}</strong>
          </dd>
          <dt>Tipo</dt>
          <dd>
            <span class="badge" [class.badge-receita]="m.tipo === 'RECEITA'" [class.badge-despesa]="m.tipo === 'DESPESA'">
              {{ m.tipo === 'RECEITA' ? 'Receita' : 'Despesa' }}
            </span>
          </dd>
          <dt>Categoria</dt>
          <dd><a [routerLink]="['/categorias', m.categoriaId]">{{ m.categoriaNome }}</a></dd>
          <dt>Data</dt>
          <dd>{{ m.data | dataBr }}</dd>
        </dl>
      </div>

      @if (confirmando()) {
        <app-confirm-dialog
          titulo="Excluir transação?"
          mensagem="Esta ação é permanente e não poderá ser desfeita."
          [resumo]="m.descricao + ' — ' + (m.valor | currency: 'BRL')"
          [processando]="processando()"
          (confirmar)="excluir(m)"
          (cancelar)="confirmando.set(false)"
        />
      }
    } @else if (erro()) {
      <div class="erro-form" role="alert">{{ erro() }}</div>
    } @else {
      <p class="muted">Carregando...</p>
    }
  `,
})
export class TransacaoDetalheComponent implements OnInit {
  private readonly rota = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(MovimentacaoService);
  private readonly avisos = inject(NotificationService);

  protected readonly mov = signal<Movimentacao | null>(null);
  protected readonly erro = signal<string | null>(null);
  protected readonly confirmando = signal(false);
  protected readonly processando = signal(false);

  ngOnInit(): void {
    const id = Number(this.rota.snapshot.paramMap.get('id'));
    if (Number.isNaN(id)) {
      this.erro.set('Movimentação inválida.');
      return;
    }
    this.service.buscar(id).subscribe({
      next: (m) => this.mov.set(m),
      error: (e: unknown) => this.erro.set(mensagemDeErro(e)),
    });
  }

  protected excluir(m: Movimentacao): void {
    this.processando.set(true);
    this.service.excluir(m.id).subscribe({
      next: () => {
        this.avisos.sucesso('Movimentação excluída com sucesso.');
        this.router.navigate(['/transacoes']);
      },
      error: (e: unknown) => {
        this.processando.set(false);
        this.confirmando.set(false);
        this.avisos.erro(mensagemDeErro(e));
      },
    });
  }
}
