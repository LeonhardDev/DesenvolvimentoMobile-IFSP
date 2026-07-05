import { apiFetch } from './client';
import type { Project, ProjectRequest } from '../types';

export function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>('/projects');
}

export function getProject(id: number): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`);
}

export function createProject(request: ProjectRequest): Promise<Project> {
  return apiFetch<Project>('/projects', { method: 'POST', body: request });
}

export function updateProject(id: number, request: ProjectRequest): Promise<Project> {
  return apiFetch<Project>(`/projects/${id}`, { method: 'PUT', body: request });
}

export function deleteProject(id: number): Promise<void> {
  return apiFetch<void>(`/projects/${id}`, { method: 'DELETE' });
}
