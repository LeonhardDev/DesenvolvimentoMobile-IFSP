# TaskFlow — Backend

API REST do TaskFlow: gerenciador de projetos e tarefas em equipe (estilo Jira/Trello).
Autenticação via JWT, autorização por dono/membro de projeto, e progresso de projeto
calculado a partir das tarefas concluídas.

## Stack

- **Java 21** + **Spring Boot 4.1** (Web MVC, Data JPA, Security, Validation)
- **PostgreSQL 16** com migrações versionadas via **Flyway**
- **JWT** (biblioteca `jjwt`) para autenticação stateless
- **springdoc-openapi** (Swagger UI) para documentação interativa
- **Testcontainers** + JUnit 5 para testes de integração contra um Postgres real
- Build: **Maven** (wrapper `./mvnw`)

## Como rodar (perfil `dev`)

Pré-requisitos: Java 21, Docker (para o Postgres e para os testes).

1. **Configurar variáveis** — copie `.env.example` para `.env` e defina:
   ```
   DB_USERNAME=postgres
   DB_PASSWORD=uma_senha_qualquer
   JWT_SECRET=<chave Base64 com >= 256 bits>
   ```
   Gere um `JWT_SECRET` válido (Base64), por exemplo:
   ```bash
   openssl rand -base64 48
   ```

2. **Subir o banco** (Postgres exposto na porta **5433** do host):
   ```bash
   docker compose up -d
   ```

3. **Exportar as variáveis no shell** (o Spring lê `DB_PASSWORD`/`JWT_SECRET` do ambiente).
   - Bash/macOS/Linux: `export DB_PASSWORD=... JWT_SECRET=...`
   - PowerShell: `$env:DB_PASSWORD="..."; $env:JWT_SECRET="..."`

4. **Rodar a aplicação** com o perfil `dev` (que aponta para `localhost:5433`):
   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

A API sobe em **http://localhost:8080** (sem prefixo de contexto).
Swagger UI: **http://localhost:8080/swagger-ui.html**.

> `ddl-auto: validate` — o schema é 100% gerido pelo Flyway (`src/main/resources/db/migration`).
> O Hibernate apenas valida se as entidades batem com as tabelas; ele nunca altera o schema.

## Testes

```bash
./mvnw test
```
Os testes de integração sobem um Postgres efêmero via Testcontainers (requer Docker) e
não usam o banco do `docker compose`.

## Arquitetura (camadas)

```
controller -> service -> repository -> (Postgres)
                  \-- mapper (entidade -> DTO de resposta)
```

- **`controller/`** — endpoints REST finos; apenas delegam ao service e injetam o usuário
  autenticado (`@AuthenticationPrincipal CustomUserPrincipal`).
- **`service/`** — regras de negócio, transacionais. `AuthorizationService` centraliza as
  regras de acesso (dono/membro/admin).
- **`repository/`** — Spring Data JPA.
- **`mapper/`** — conversão de entidades para os DTOs de resposta (`record`s).
- **`dto/request` e `dto/response`** — contratos de entrada/saída (todos `record`s; os nomes
  dos campos JSON são exatamente os nomes dos componentes).
- **`model/`** — entidades JPA e enums.
- **`security/`** — filtro JWT, geração/validação de token e `UserDetails` customizado.
- **`exception/`** — `GlobalExceptionHandler` padroniza todos os erros no formato `ApiError`.

## Autenticação

1. `POST /auth/register` ou `POST /auth/login` retornam `AuthResponse`:
   ```json
   { "token": "<jwt>", "user": { "id": 1, "name": "Ana", "email": "ana@x.com" } }
   ```
2. Envie o token em todas as demais chamadas:
   ```
   Authorization: Bearer <jwt>
   ```
O token expira em 24h e carrega os claims `userId` e `role` (a `role` não é exposta em nenhum
DTO — só existe dentro do JWT).

## Endpoints

Todas as rotas exigem `Authorization: Bearer <token>`, **exceto** `/auth/**` e o Swagger.

| Método | Rota | Descrição | Sucesso |
|--------|------|-----------|---------|
| POST | `/auth/register` | Cadastro (retorna token) | 201 |
| POST | `/auth/login` | Login (retorna token) | 200 |
| GET | `/users` | Lista usuários (id/nome/email) — usado nos seletores do app | 200 |
| GET | `/projects` | Lista projetos do usuário (admin vê todos) | 200 |
| GET | `/projects/{id}` | Detalha um projeto | 200 |
| POST | `/projects` | Cria projeto (autor vira dono e membro) | 201 |
| PUT | `/projects/{id}` | Atualiza projeto (só o dono) | 200 |
| DELETE | `/projects/{id}` | Exclui projeto (só o dono) | 204 |
| GET | `/projects/{projectId}/tasks` | Lista tarefas do projeto (filtro `?status=`) | 200 |
| POST | `/projects/{projectId}/tasks` | Cria tarefa no projeto | 201 |
| GET | `/tasks/{id}` | Detalha uma tarefa | 200 |
| PUT | `/tasks/{id}` | Atualiza tarefa (criador/responsável) | 200 |
| PATCH | `/tasks/{id}/status` | Atualiza só o status | 200 |
| DELETE | `/tasks/{id}` | Exclui tarefa (criador/responsável) | 204 |
| GET | `/dashboard/summary` | Contadores da Home (hoje/atrasadas) do usuário | 200 |
| GET | `/dashboard/activities?limit=10` | Feed de atividades recentes do usuário | 200 |

### Enums (valores exatos, MAIÚSCULAS sem acento)

- **TaskStatus**: `A_FAZER`, `EM_ANDAMENTO`, `CONCLUIDA`
- **Priority**: `BAIXA`, `MEDIA`, `ALTA`
- **ProjectStatus**: `ATIVO`, `CONCLUIDO`
- **Role** (interno, não exposto): `USER`, `ADMIN`

Datas (`dueDate`) no formato ISO `yyyy-MM-dd`.

### Formato de erro (`ApiError`)

```json
{
  "timestamp": "2026-07-05T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Erro de validação",
  "path": "/projects",
  "fieldErrors": { "name": "Nome é obrigatório" }
}
```
`fieldErrors` só aparece preenchido em erros de validação.

## Integração com o app (frontend)

O app React Native (Expo) em `../front_end/TaskFlow` consome esta API:

- **baseURL** configurável via `EXPO_PUBLIC_API_URL`. Em dispositivo físico (Expo Go), use o
  **IP da máquina** que roda o backend: `http://<IP-da-maquina>:8080` (celular e PC na mesma rede).
- Fluxo: login/registro → guarda o `token` → envia `Authorization: Bearer <token>` nas demais
  chamadas. O app traduz os enums do backend para os rótulos em português exibidos na UI.
- CORS está liberado para dev (irrelevante para apps nativos, evita bloqueio no Expo web).
