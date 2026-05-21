import { useState, useCallback } from 'react';

const TOKEN_KEY = 'admin_token';

function readToken(): string | null {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export interface AdminAuth {
  isAdmin: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export function useAdminAuth(): AdminAuth {
  const [token, setToken] = useState<string | null>(readToken);

  const login = useCallback((t: string) => {
    try { sessionStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    setToken(null);
  }, []);

  return { isAdmin: token !== null, token, login, logout };
}
