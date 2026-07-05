import { API_BASE_URL } from '../config';
import type { ApiError } from '../types';

/**
 * Erro lançado quando a API responde com status de erro. Carrega a mensagem amigável
 * do backend (ApiError.message) e os erros de campo (fieldErrors), quando houver.
 */
export class ApiFetchError extends Error {
  status: number;
  fieldErrors?: Record<string, string> | null;

  constructor(status: number, message: string, fieldErrors?: Record<string, string> | null) {
    super(message);
    this.name = 'ApiFetchError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// O token e o tratador de 401 são injetados pelo AuthContext, evitando acoplar o
// cliente HTTP ao armazenamento/estado de autenticação.
let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiFetchError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.');
  }

  if (response.status === 401) {
    onUnauthorized?.();
    throw new ApiFetchError(401, 'Sessão expirada. Faça login novamente.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = data as ApiError | null;
    throw new ApiFetchError(
      response.status,
      error?.message ?? 'Ocorreu um erro inesperado.',
      error?.fieldErrors,
    );
  }

  return data as T;
}
