# Up Finances API (Back End) — Trabalho do 2º bimestre

API REST de organização financeira pessoal (Spring Boot 3.3.2, Java 17, Spring Data JPA, PostgreSQL, Spring Security + JWT, Swagger).

## Como rodar
1. Tenha o PostgreSQL com o banco `upfinances` (porta `6670`, usuário `postgres`). Ajuste em `src/main/resources/application.properties` se necessário.
2. Informe a senha do banco: `export DB_PASSWORD=sua_senha` (ou edite o `application.properties`).
3. `mvn spring-boot:run` (ou rode `UpFinancesApplication` no IntelliJ).
4. Swagger: http://localhost:8080/swagger-ui.html

As tabelas (`usuario`, `categoria`, `movimentacao`) são criadas pelo Hibernate (`ddl-auto=update`).
Na primeira execução são criados um admin e categorias padrão:

| E-mail | Senha | Perfil |
|---|---|---|
| admin@upfinances.com | admin123 | ADMIN |

## Camadas e pacotes
`controller` → `service` (regras de negócio) → `repository` (Spring Data JPA) → `model` (entidades). Entrada e saída usam `record` em `dto`. Erros padronizados em `exception`; JWT em `security`; CORS/Swagger/segurança em `config`.

## Modelo (1:N)
- `Categoria` 1:N `Movimentacao`
- `Usuario` 1:N `Movimentacao`
- O tipo (RECEITA/DESPESA) vem da categoria.

## Endpoints
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | /auth/login | público | Retorna o token JWT |
| POST | /auth/registro | público | Cria usuário COMUM |
| GET | /categorias, /categorias/{id} | logado | Listar / buscar |
| POST, PUT, DELETE | /categorias[/{id}] | **ADMIN** | Criar / editar / excluir |
| GET | /categorias/{id}/movimentacoes | logado | **Consulta com filtro no path** |
| GET | /movimentacoes?tipo=&descricao=&dataInicio=&dataFim=&valorMin=&valorMax= | logado | **Consulta com múltiplos parâmetros** (todos opcionais) |
| GET, POST, PUT, DELETE | /movimentacoes[/{id}] | logado | CRUD completo |

COMUM enxerga e altera só as próprias movimentações; ADMIN enxerga todas.

## Regras de negócio (na camada de serviço)
- RN01: valor maior que zero.
- RN02: tipo definido pela categoria.
- RN03: descrição, data e categoria obrigatórias.
- Categoria com movimentações não pode ser excluída (409).

## Testando
1. `POST /auth/login` com `{"email":"admin@upfinances.com","senha":"admin123"}`.
2. No Swagger, clique em **Authorize** e cole o token. No Postman, use Bearer Token.
3. `POST /movimentacoes`:
```json
{ "descricao": "Compra no mercado", "valor": 150.50, "data": "2026-11-19", "categoriaId": 3 }
```

Códigos de erro: 400 (dados inválidos), 401 (sem login/token inválido), 403 (perfil sem permissão), 404 (não encontrado), 409 (conflito).
