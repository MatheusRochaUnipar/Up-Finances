import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api.config';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const avisos = inject(NotificationService);

  const daApi = req.url.startsWith(API_URL);
  const rotaPublica = req.url.startsWith(`${API_URL}/auth/`);
  const token = auth.token;

  const requisicao =
    daApi && !rotaPublica && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      if (erro instanceof HttpErrorResponse && erro.status === 401 && daApi && !rotaPublica) {
        auth.logout();
        avisos.erro('Sua sessão expirou. Faça login novamente.');
      }
      return throwError(() => erro);
    }),
  );
};
