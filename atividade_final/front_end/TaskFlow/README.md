# TaskFlow — App (React Native / Expo)

Aplicativo mobile do TaskFlow: login, projetos, tarefas (com detalhe e atualização de
status) e uma visão geral (Home). Consome a API do backend em `../../back_end`.

## Stack

- **Expo SDK 57** + **React Native 0.86** + **React 19** (TypeScript `strict`)
- **React Navigation 7** (native stack + bottom tabs)
- **expo-secure-store** para guardar o JWT com segurança
- `fetch` nativo para as chamadas HTTP (sem libs extras de rede)

## Configuração da API (`EXPO_PUBLIC_API_URL`)

O app lê a URL base do backend da variável `EXPO_PUBLIC_API_URL` (padrão `http://localhost:8080`).

Em **dispositivo físico (Expo Go)**, `localhost` aponta para o próprio celular — use o **IP da
máquina** que roda o backend (celular e PC na mesma rede Wi-Fi). Descubra o IP com `ipconfig`
(Windows) / `ifconfig` (macOS/Linux) e inicie o Expo assim:

```bash
# Windows (PowerShell)
$env:EXPO_PUBLIC_API_URL="http://192.168.0.10:8080"; npx expo start

# macOS/Linux
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080 npx expo start
```

Garanta que o backend esteja rodando (veja `../../back_end/README.md`) e acessível na rede.

## Como rodar

```bash
npm install
npx expo start
```
Abra no **Expo Go** (escaneando o QR code) ou num emulador. Faça login com um usuário
cadastrado no backend (ou registre um via `POST /auth/register`).

Type-check:
```bash
npx tsc --noEmit
```

## Arquitetura (`src/`)

```
src/
  config.ts            # API_BASE_URL (EXPO_PUBLIC_API_URL)
  types/               # interfaces espelhando os DTOs do backend + enums
  api/
    client.ts          # wrapper de fetch: injeta Bearer token, trata ApiError e 401
    auth.ts projects.ts tasks.ts users.ts dashboard.ts
  context/
    AuthContext.tsx    # sessão (token + user), persistência em SecureStore, role via JWT
  navigation/types.ts  # tipagem das rotas (RootStackParamList, MainTabParamList)
  utils/
    mappers.ts         # tradução enum(backend) <-> rótulo PT, iniciais, datas, tempo relativo
    jwt.ts             # decodifica o claim `role` do token
  screens/             # Login, Home, Projects, Tasks, TaskDetails, Profile, NewProject, NewTask
```

### Fluxo de autenticação

1. `LoginScreen` chama `AuthContext.signIn` → `POST /auth/login`.
2. O token e o usuário são guardados no SecureStore; o token é injetado em todas as chamadas.
3. Ao abrir o app, a sessão é restaurada do SecureStore (sem novo login).
4. Qualquer resposta `401` encerra a sessão automaticamente e volta ao Login.

### Enums

O backend usa enums em MAIÚSCULAS sem acento (`A_FAZER`, `EM_ANDAMENTO`, `CONCLUIDA`,
`BAIXA/MEDIA/ALTA`, `ATIVO/CONCLUIDO`). A UI exibe rótulos em português — a tradução fica
centralizada em `src/utils/mappers.ts`.

## Observações

- A tela de **Projetos** lista os projetos reais; tocar num card abre as **Tarefas** daquele
  projeto. É possível criar projetos e tarefas (CRUD) e atualizar o status de uma tarefa.
- A **Home** usa os endpoints `/dashboard/summary` e `/dashboard/activities`.
- O perfil mostra o nome/e-mail do usuário logado e a role lida do JWT.
- App em modo *light* apenas (`app.json`), fiel ao protótipo do Figma.
