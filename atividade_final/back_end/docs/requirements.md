# TaskFlow — Requisitos do Backend

> Destilado a partir de `RelatorioTaskFlow.pdf` (planejamento ágil) e `projeto_wireframe.pdf`
> (mockups das telas). Projeto acadêmico (IFSP Guarulhos, TADS) em trio — este documento cobre
> apenas o escopo do **backend**, que Gustavo está construindo em Java 21 + Spring Boot.
>
> Legenda: 🔵 = vem direto dos documentos originais · 🟢 = inferido/enriquecido pela leitura das telas
> (sinalizado para validação).

## 1. Visão geral

Sistema de gestão de tarefas em equipes e projetos (estilo Jira), consumido por um app mobile
(React Native, sendo construído pelo restante do trio). O backend expõe uma API REST.

## 2. Atores e papéis 🔵

- **ADMIN** — acesso irrestrito, visão geral de todo o sistema (todos os projetos/tarefas de todos os usuários).
- **USER** — só cria/visualiza/edita os próprios projetos e tarefas (ou tarefas em projetos dos quais é membro).

## 3. Entidades

### User 🔵
- id, nome, e-mail (único), senha (hash), role (`USER` | `ADMIN`)

### Project 🟢
- id, nome, descrição/categoria (ex: "Design & Dev", "Produto" — visto nos cards da tela "Meus Projetos")
- status (`ATIVO` | `CONCLUIDO`) — os cards mostram "Em andamento" / "Concluído"
- owner (usuário criador)
- membros (relação N:N com User — a tela mostra "4 membros", "6 membros" por projeto)
- progresso: **não deve ser um campo armazenado** — calcular como `tarefas concluídas / total de tarefas` (a tela mostra 58%, 7/12 tarefas etc., isso é derivado, não persistido)

### Task 🔵/🟢
- id, título, descrição
- status (`A_FAZER` | `EM_ANDAMENTO` | `CONCLUIDA`) 🔵 — bate com as 3 abas do wireframe e as 3 colunas do Kanban do relatório (Todo/In Progress/Done)
- prioridade (`BAIXA` | `MEDIA` | `ALTA`) 🟢 — wireframe só mostra "Alta", mas claramente é um enum; completei com Baixa/Média
- prazo (data) 🔵
- estimativa em horas 🟢 (aparece na tela de detalhe — opcional, fácil de incluir já que é só um número)
- project (FK — toda tarefa pertence a um projeto) 🔵
- responsável (`assignee`) — **exatamente 1** usuário por tarefa (FK direta, não N:N) ✅ confirmado
- colaboradores — **N** usuários (relação N:N Task↔User) ✅ confirmado
- criador da tarefa (para a regra de permissão de exclusão/edição) 🔵

## 4. Regras de negócio 🔵

1. Usuário `USER` só enxerga/manipula projetos onde é membro (ou owner) e tarefas desses projetos.
2. Usuário `ADMIN` enxerga e manipula tudo, sem restrição.
3. Edição/exclusão de uma tarefa é restrita ao **criador** ou ao **responsável** designado da tarefa — outros membros do projeto (mesmo colaboradores da tarefa) não podem editar/excluir.
4. Autenticação via JWT (registro + login); token deve ser validado em toda rota protegida.

## 5. Endpoints inferidos das telas (rascunho — a refinar no Plan Mode)

| Tela | Endpoints prováveis |
|---|---|
| Login | `POST /auth/register`, `POST /auth/login` |
| Meus Projetos | `GET /projects` (filtrado por usuário se não-admin), `POST /projects`, contadores derivados no próprio response ou calculados no frontend |
| Tarefas do projeto | `GET /projects/{id}/tasks?status=`, `PATCH /tasks/{id}/status` |
| Detalhe da tarefa | `GET /tasks/{id}`, `PUT /tasks/{id}`, `DELETE /tasks/{id}`, `POST /tasks/{id}/members` |

## 6. Fora de escopo por enquanto (candidatos a "não fazer" dado o "básico bem feito") 🟢

- Login social ("Entrar com Google" no wireframe) — fica como stretch goal, não bloqueia o MVP.
- Anexos de arquivo na tarefa (`protótipo-login-v2.fig` no mockup) — feature de UI, não essencial pro backend acadêmico.
- Notificações (ícone de sino na tela de projetos) — sem requisito funcional explícito no relatório.

## 7. Decisões confirmadas com o Gustavo (2026-07-04)

- ✅ Gustavo assume o backend integralmente — desconsiderar a divisão de responsáveis do relatório original, focar só nas tasks/funcionalidades em si.
- ✅ Tarefa tem exatamente **1 responsável** (`assignee`) + **N colaboradores** (N:N).
- ✅ Banco de dados: **apenas PostgreSQL** (sem perfil H2 — remover essa opção do plano anterior).
