import { apiFetch } from './client';
import type { UserSummary } from '../types';

export function listUsers(): Promise<UserSummary[]> {
  return apiFetch<UserSummary[]>('/users');
}
