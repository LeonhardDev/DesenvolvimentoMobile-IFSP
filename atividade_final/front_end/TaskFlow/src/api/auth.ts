import { apiFetch } from './client';
import type { AuthResponse } from '../types';

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}

export function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: { name, email, password } });
}
