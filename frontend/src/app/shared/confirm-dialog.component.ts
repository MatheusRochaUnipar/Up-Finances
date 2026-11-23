import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="modal-backdrop" (click)="cancelar.emit()">
      <div class="modal" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
        <h2>{{ titulo }}</h2>
        <p class="muted">{{ mensagem }}</p>
        @if (resumo) {
          <p class="resumo">{{ resumo }}</p>
        }
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" (click)="cancelar.emit()">Cancelar</button>
          <button
            type="button"
            class="btn btn-danger"
            [disabled]="processando"
            (click)="confirmar.emit()"
          >
            {{ textoConfirmar }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  @Input() titulo = 'Confirmar';
  @Input() mensagem = '';
  @Input() resumo = '';
  @Input() textoConfirmar = 'Sim, excluir';
  @Input() processando = false;
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
