import { apiFetch } from './client';
import type { Task, TaskRequest, TaskStatus } from '../types';

export function listTasksByProject(projectId: number, status?: TaskStatus): Promise<Task[]> {
  const query = status ? `?status=${status}` : '';
  return apiFetch<Task[]>(`/projects/${projectId}/tasks${query}`);
}

export function getTask(id: number): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}`);
}

export function createTask(projectId: number, request: TaskRequest): Promise<Task> {
  return apiFetch<Task>(`/projects/${projectId}/tasks`, { method: 'POST', body: request });
}

export function updateTask(id: number, request: TaskRequest): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}`, { method: 'PUT', body: request });
}

export function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  return apiFetch<Task>(`/tasks/${id}/status`, { method: 'PATCH', body: { status } });
}

export function deleteTask(id: number): Promise<void> {
  return apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' });
}
