import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemDeErro } from '../core/api-error';
import { AuthService } from '../core/auth.service';
import { NotificationService } from '../core/notification.service';

function senhasIguais(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('senha')?.value === grupo.get('confirmacao')?.value ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <section class="auth-hero">
        <div class="brand"><span class="brand-dot"></span> Up Finances</div>
        <h1>Crie sua conta.</h1>
        <ul>
          <li>Leva menos de um minuto</li>
          <li>Seus dados financeiros são só seus</li>
        </ul>
      </section>

      <section class="auth-form">
        <div class="card">
          <h1>Criar conta</h1>
          <p class="muted">Preencha os dados abaixo.</p>

          <form class="form" [formGroup]="form" (ngSubmit)="cadastrar()" novalidate>
            @if (erro()) {
              <div class="erro-form" role="alert">{{ erro() }}</div>
            }

            <div class="field">
              <label for="nome">Nome</label>
              <input id="nome" class="input" type="text" formControlName="nome"
                     [class.invalido]="invalido('nome')" />
              @if (invalido('nome')) {
                <span class="erro-campo">O nome é obrigatório.</span>
              }
            </div>

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
                     autocomplete="new-password" [class.invalido]="invalido('senha')" />
              @if (invalido('senha')) {
                <span class="erro-campo">A senha deve ter pelo menos 8 caracteres.</span>
              }
            </div>

            <div class="field">
              <label for="confirmacao">Confirmação de senha</label>
              <input id="confirmacao" class="input" type="password" formControlName="confirmacao"
                     autocomplete="new-password" [class.invalido]="invalido('confirmacao') || diferentes()" />
              @if (diferentes()) {
                <span class="erro-campo">A confirmação deve ser igual à senha.</span>
              }
            </div>

            <button type="submit" class="btn btn-primary btn-block" [disabled]="enviando()">
              {{ enviando() ? 'Criando...' : 'Criar conta' }}
            </button>
          </form>

          <p class="muted" style="margin-top: 16px">
            Já tem conta? <a routerLink="/login">Entrar</a>
          </p>
        </div>
      </section>
    </div>
  `,
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly avisos = inject(NotificationService);

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group(
    {
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      confirmacao: ['', [Validators.required]],
    },
    { validators: senhasIguais },
  );

  protected invalido(campo: 'nome' | 'email' | 'senha' | 'confirmacao'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  protected diferentes(): boolean {
    const c = this.form.controls.confirmacao;
    return this.form.hasError('senhasDiferentes') && (c.touched || c.dirty);
  }

  protected cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Preencha todos os campos. A senha deve ter pelo menos 8 caracteres e ser igual à confirmação.');
      return;
    }
    this.erro.set(null);
    this.enviando.set(true);
    const { nome, email, senha } = this.form.getRawValue();
    this.auth.registrar(nome.trim(), email.trim(), senha).subscribe({
      next: () => {
        this.enviando.set(false);
        this.avisos.sucesso('Conta criada com sucesso. Faça login para continuar.');
        this.router.navigate(['/login']);
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        this.erro.set(mensagemDeErro(e));
      },
    });
  }
}
