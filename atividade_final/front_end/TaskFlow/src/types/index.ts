/**
 * Tipos que espelham exatamente os contratos (DTOs) do backend Spring Boot.
 * Os enums usam os valores literais do backend (MAIÚSCULAS, sem acento).
 * A tradução para os rótulos em português exibidos na UI fica em `utils/mappers.ts`.
 */

export type TaskStatus = 'A_FAZER' | 'EM_ANDAMENTO' | 'CONCLUIDA';
export type Priority = 'BAIXA' | 'MEDIA' | 'ALTA';
export type ProjectStatus = 'ATIVO' | 'CONCLUIDO';
export type Role = 'USER' | 'ADMIN';

export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface Project {
  id: number;
  name: string;
  category: string | null;
  status: ProjectStatus;
  owner: UserSummary;
  members: UserSummary[];
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null; // ISO yyyy-MM-dd
  estimatedHours: number | null;
  projectId: number;
  creator: UserSummary;
  assignee: UserSummary;
  collaborators: UserSummary[];
}

export interface DashboardSummary {
  tasksDueToday: number;
  overdueTasks: number;
}

export interface Activity {
  type: string; // ex.: TASK_COMPLETED, PROJECT_CREATED
  message: string;
  timestamp: string; // ISO instant
}

/** Corpo padronizado de erro do backend (ApiError). */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string> | null;
}

// ---- Payloads de escrita (CRUD) ----

export interface ProjectRequest {
  name: string;
  category?: string | null;
  memberIds?: number[];
}

export interface TaskRequest {
  title: string;
  description?: string | null;
  priority: Priority;
  dueDate?: string | null;
  estimatedHours?: number | null;
  assigneeId: number;
  collaboratorIds?: number[];
}
