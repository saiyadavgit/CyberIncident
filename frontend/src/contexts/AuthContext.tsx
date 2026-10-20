import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as authService from '../services/authService';
import { onAuthFailure, setRequestAdapter, TOKEN_KEY, USER_KEY } from '../utils/api';
import { demoAdapter } from '../utils/demoAdapter';
import { isJwtExpired } from '../utils/jwt';
import { normalizeAuthUser } from '../utils/normalize';
import type { AuthResult, AuthUser, LoginInput, RegisterInput } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  demoMode: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<{signedIn: boolean;user?: AuthUser;}>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function readStoredSession(demoMode: boolean): AuthResult | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;
  const isDemoToken = token.startsWith('demo-token:');
  if (isDemoToken !== demoMode || isJwtExpired(token)) {
    clearStorage();
    return null;
  }
  try {
    return { token, user: normalizeAuthUser(JSON.parse(rawUser)) };
  } catch {
    clearStorage();
    return null;
  }
}

function persist(result: AuthResult) {
  localStorage.setItem(TOKEN_KEY, result.token);
  localStorage.setItem(USER_KEY, JSON.stringify(result.user));
}

export function AuthProvider({ demoMode, children }: {demoMode: boolean;children: React.ReactNode;}) {
  const configured = useRef<boolean | null>(null);
  if (configured.current !== demoMode) {
    setRequestAdapter(demoMode ? demoAdapter : null);
    configured.current = demoMode;
  }

  const navigate = useNavigate();
  const [session, setSession] = useState<AuthResult | null>(() => readStoredSession(demoMode));

  useEffect(() => {
    setSession(readStoredSession(demoMode));
  }, [demoMode]);

  useEffect(() => {
    onAuthFailure((status, hadToken, silent) => {
      if (status === 401) {
        if (hadToken) {
          setSession(null);
          toast.error('Your session has expired. Sign in again.');
          navigate('/login', { replace: true });
        }
      } else if (!silent) {
        toast.error("Your role doesn't permit that action.");
      }
    });
    return () => onAuthFailure(null);
  }, [navigate]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await authService.login(input);
    persist(result);
    setSession(result);
    return result.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await authService.register(input);
    if (result) {
      persist(result);
      setSession(result);
      return { signedIn: true, user: result.user };
    }
    return { signedIn: false };
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setSession(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      demoMode,
      login,
      register,
      logout
    }),
    [session, demoMode, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}