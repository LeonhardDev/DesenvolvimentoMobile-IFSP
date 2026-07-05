import { apiFetch } from './client';
import type { Activity, DashboardSummary } from '../types';

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>('/dashboard/summary');
}

export function getActivities(limit = 10): Promise<Activity[]> {
  return apiFetch<Activity[]>(`/dashboard/activities?limit=${limit}`);
}
