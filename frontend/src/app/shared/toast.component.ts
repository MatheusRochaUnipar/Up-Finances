import { Component, inject } from '@angular/core';
import { NotificationService } from '../core/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container" aria-live="polite">
      @for (aviso of avisos.avisos(); track aviso.id) {
        <div class="toast" [class]="'toast toast-' + aviso.tipo" role="status">
          <span>{{ aviso.texto }}</span>
          <button type="button" class="toast-close" aria-label="Fechar" (click)="avisos.fechar(aviso.id)">×</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected readonly avisos = inject(NotificationService);
}
