import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemDeErro } from '../core/api-error';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <section class="auth-hero">
        <div class="brand"><span class="brand-dot"></span> Up Finances</div>
        <h1>Comece a cuidar melhor do seu dinheiro.</h1>
        <ul>
          <li>Registre receitas e despesas em segundos</li>
          <li>Organize tudo por categoria</li>
          <li>Acompanhe o saldo e os gastos do mês</li>
        </ul>
      </section>

      <section class="auth-form">
        <div class="card">
          <h1>Entrar</h1>
          <p class="muted">Acesse sua conta para continuar.</p>

          <form class="form" [formGroup]="form" (ngSubmit)="entrar()" novalidate>
            @if (erro()) {
              <div class="erro-form" role="alert">{{ erro() }}</div>
            }

            <div class="field">
              <label for="email">E-mail</label>
              <input id="email" class="input" type="email" formControlName="email"
                     autocomplete="username" [class.invalido]="invalido('email')" />
              @if (invalido('email')) {
                <span class="erro-campo">Informe um e-mail válido.</span>
              }
            </div>

            <div class="field">
              <label for="senha">Senha</label>
              <input id="senha" class="input" type="password" formControlName="senha"
                     autocomplete="current-password" [class.invalido]="invalido('senha')" />
              @if (invalido('senha')) {
                <span class="erro-campo">A senha é obrigatória.</span>
              }
            </div>

            <button type="submit" class="btn btn-primary btn-block" [disabled]="enviando()">
              {{ enviando() ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>

          <p class="muted" style="margin-top: 16px">
            Não tem conta? <a routerLink="/cadastro">Cadastre-se</a>
          </p>
        </div>
      </section>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  protected invalido(campo: 'email' | 'senha'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.erro.set(null);
    this.enviando.set(true);
    const { email, senha } = this.form.getRawValue();
    this.auth.login(email.trim(), senha).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/painel']);
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(e));
      },
    });
  }
}
