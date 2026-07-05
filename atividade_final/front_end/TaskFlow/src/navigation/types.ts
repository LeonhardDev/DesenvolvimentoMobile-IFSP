/**
 * Tipagem das rotas da navegação. Substitui o `useNavigation<any>()` original,
 * habilitando a passagem tipada de `taskId`/`projectId` entre telas.
 */

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  TaskDetails: { taskId: number };
  NewProject: undefined;
  NewTask: { projectId: number };
};

export type MainTabParamList = {
  Inicio: undefined;
  Projetos: undefined;
  Tarefas: { projectId?: number } | undefined;
  Perfil: undefined;
};
