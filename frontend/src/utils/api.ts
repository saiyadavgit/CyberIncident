import axios, { type AxiosAdapter } from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Suppress the global 403 toast for background/optional requests. */
    silent?: boolean;
  }
}

const env = (import.meta as unknown as {env?: Record<string, string | undefined>;}).env;
export const API_BASE_URL = env?.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

const defaultAdapter = api.defaults.adapter;

type AuthFailureHandler = (status: 401 | 403, hadToken: boolean, silent: boolean) => void;
let authFailureHandler: AuthFailureHandler | null = null;

export function onAuthFailure(handler: AuthFailureHandler | null) {
  authFailureHandler = handler;
}

export function setRequestAdapter(adapter: AxiosAdapter | null) {
  api.defaults.adapter = adapter ?? defaultAdapter;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      // Read failures surface in-page via error states; only mutations get the global permission toast.
      const silent = Boolean(error.config?.silent) || (error.config?.method ?? 'get').toLowerCase() === 'get';
      if (status === 401) {
        const hadToken = Boolean(localStorage.getItem(TOKEN_KEY));
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        authFailureHandler?.(401, hadToken, silent);
      } else if (status === 403) {
        authFailureHandler?.(403, true, silent);
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (typeof data === 'string' && data.trim() && data.length < 240) return data;
    if (data && typeof data === 'object') {
      const o = data as Record<string, unknown>;
      for (const key of ['message', 'error', 'detail']) {
        const v = o[key];
        if (typeof v === 'string' && v.trim()) return v;
      }
    }
    const status = error.response?.status;
    if (!error.response) return "Can't reach the incident service. Check that the backend is running.";
    if (status === 401) return 'Invalid credentials or your session has expired.';
    if (status === 403) return "Your role doesn't permit this action.";
    if (status === 404) return 'The requested record was not found.';
    if (status === 413) return 'File exceeds the 10 MB upload limit.';
    if (status && status >= 500) return 'The incident service returned an error. Try again shortly.';
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}