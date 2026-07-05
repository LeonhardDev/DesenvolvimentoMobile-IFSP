import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin } from '../api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import type { Role, UserSummary } from '../types';
import { roleFromToken } from '../utils/jwt';

const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

interface AuthState {
  user: UserSummary | null;
  role: Role;
  /** true enquanto restaura a sessão do armazenamento seguro (evita piscar a tela de login). */
  restoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [role, setRole] = useState<Role>('USER');
  const [restoring, setRestoring] = useState(true);

  const applySession = useCallback((token: string, sessionUser: UserSummary) => {
    setAuthToken(token);
    setUser(sessionUser);
    setRole(roleFromToken(token));
  }, []);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    setRole('USER');
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }, []);

  // Restaura a sessão persistida ao abrir o app.
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const userJson = await SecureStore.getItemAsync(USER_KEY);
        if (token && userJson) {
          applySession(token, JSON.parse(userJson) as UserSummary);
        }
      } finally {
        setRestoring(false);
      }
    })();
  }, [applySession]);

  // Quando qualquer chamada recebe 401, encerra a sessão automaticamente.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin(email, password);
      applySession(response.token, response.user);
      await SecureStore.setItemAsync(TOKEN_KEY, response.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo<AuthState>(
    () => ({ user, role, restoring, signIn, signOut }),
    [user, role, restoring, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
