# Up Finances

Aplicação web de **organização financeira pessoal**: o usuário registra receitas e despesas, organiza por categorias e acompanha saldo e relatórios do mês.

Trabalho do 2º bimestre — Unipar, Desenvolvimento Back End / Front End.
**Grupo:** Danieli Silva e Matheus Rocha · **Professora:** Juliane Frabel

## Estrutura do repositório

| Pasta | Conteúdo | Documentação |
|---|---|---|
| [`backend/`](backend) | API REST em Spring Boot 3.3.2, Java 17, Spring Data JPA, PostgreSQL, Spring Security + JWT e Swagger | [backend/README.md](backend/README.md) |
| [`frontend/`](frontend) | Aplicação Angular 18 (componentes standalone) que consome a API | [frontend/README.md](frontend/README.md) |

## Funcionalidades

- Login e cadastro com autenticação por token JWT
- Perfis **ADMIN** e **COMUM** (só o admin cria, edita e exclui categorias; o usuário comum vê apenas as próprias movimentações)
- CRUD completo de movimentações, com categoria (relacionamento 1:N)
- Busca de movimentações com múltiplos filtros: tipo, descrição, período e faixa de valor
- Consulta das movimentações de uma categoria
- Painel com saldo, receitas e despesas do mês e gastos por categoria
- Relatórios de receitas x despesas
- Tratamento padronizado de erros (400, 401, 403, 404 e 409)

## Como rodar

Ordem: **PostgreSQL → back end → front end**.

### 1. Banco de dados
Crie um banco PostgreSQL chamado `upfinances` (porta `6670`, usuário `postgres`). As tabelas são criadas automaticamente pelo Hibernate na primeira execução.

### 2. Back end
Pré-requisitos: Java 17 e Maven.

```bash
cd backend
export DB_PASSWORD=sua_senha      # no Windows (CMD): set DB_PASSWORD=sua_senha
mvn spring-boot:run
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

Se o seu banco usar outra porta ou usuário, ajuste `backend/src/main/resources/application.properties`.

### 3. Front end
Pré-requisitos: Node.js 18.19+ (ou 20/22) e npm.

```bash
cd frontend
npm install
npm start
```

- Aplicação: http://localhost:4200

## Acesso para testar

Na primeira execução do back end são criados um administrador e categorias padrão:

| E-mail | Senha | Perfil |
|---|---|---|
| admin@upfinances.com | admin123 | ADMIN |

Qualquer pessoa também pode criar uma conta comum na tela de **Cadastro** (senha com pelo menos 8 caracteres).

## Tecnologias

**Back end:** Java 17 · Spring Boot 3.3.2 · Spring Data JPA · Spring Security · JWT · PostgreSQL · Swagger (OpenAPI) · Maven

**Front end:** Angular 18 · TypeScript · HttpClient com interceptor · Guards de rota · Formulários com validação
