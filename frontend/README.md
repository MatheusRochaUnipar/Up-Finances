# Up Finances — Front End (Trabalho do 2º bimestre)

Aplicação **Angular 18** (componentes standalone) que consome a API REST do back end (`../backend`). Grupo: Danieli Silva e Matheus Rocha — Unipar, Desenvolvimento Back End / Front End, Profa. Juliane Frabel.

## Como rodar

Pré-requisitos: **Node.js 18.19+ (ou 20/22)** e npm. O back end deve estar no ar em `http://localhost:8080` (veja o `README.md` da pasta `backend`).

```bash
cd frontend
npm install
npm start          # ng serve -> http://localhost:4200
```

O back end já libera CORS para `http://localhost:4200`. Se a API rodar em outro endereço, ajuste `src/app/core/api.config.ts`.

Para gerar a versão de produção: `npm run build` (saída em `dist/up-finances`).

## Acesso para testar

| E-mail | Senha | Perfil |
|---|---|---|
| admin@upfinances.com | admin123 | ADMIN (altera categorias, vê todas as movimentações) |

Qualquer pessoa pode criar uma conta comum em **Cadastro** (senha com pelo menos 8 caracteres).

## Telas e rotas

| Rota | Tela | Requisito do enunciado |
|---|---|---|
| `/login`, `/cadastro` | Login e cadastro | Login, token enviado nas requisições, redirecionamento |
| `/painel` | Saldo, receitas/despesas do mês, gastos por categoria, recentes | — |
| `/transacoes` | Extrato + **formulário de busca** (tipo, descrição, data inicial/final, valor mín./máx.) | Consulta com múltiplos parâmetros (`GET /movimentacoes?...`) |
| `/transacoes/nova`, `/transacoes/:id/editar` | Formulário de cadastro/edição com **select de categoria** | CRUD + relacionamento 1:N |
| `/transacoes/:id` | Detalhes da movimentação | Busca por ID |
| (botão Excluir) | Janela de confirmação antes de excluir | Exclusão com confirmação |
| `/categorias` | Categorias (criar/editar/excluir só para ADMIN) | Perfis admin/comum |
| `/categorias/:id` | Movimentações de uma categoria | Consulta com filtro no path (`GET /categorias/{id}/movimentacoes`) |
| `/relatorios` | Receitas x despesas e gastos por categoria no mês | — |

## Organização do código

```
src/app/
  core/       AuthService (login/logout/token), interceptor (Bearer + 401), guards, tratamento de erros, avisos
  models/     interfaces TypeScript espelhando os DTOs da API
  services/   MovimentacaoService e CategoriaService — única camada que faz chamadas HTTP
  layout/     ShellComponent (menu lateral + área de conteúdo)
  pages/      uma tela por componente
  shared/     janela de confirmação, toasts, pipe de data, utilitários de data
  app.routes.ts   rotas (telas internas protegidas por authGuard)
```

- **Login:** o token JWT fica em `localStorage` e é enviado em `Authorization: Bearer ...` pelo interceptor. Sem login, as telas internas redirecionam para `/login`. O botão **Sair** limpa a sessão.
- **Erros:** respostas 400, 401, 403, 404 e 409 da API viram mensagens claras (toast ou aviso no formulário). Resposta 401 em rota protegida encerra a sessão.
- **Validação:** campos obrigatórios, valor maior que zero e senhas iguais são validados antes de enviar.

## Observações

- Os dados vêm sempre da API (sem mock). Painel e Relatórios calculam os totais a partir de `GET /movimentacoes`.
- A documentação prevê forma de pagamento e metas por categoria (RF09 a RF11); essas funções ainda não existem na API e por isso não aparecem no front.
