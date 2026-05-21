import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

const TOKEN_KEY = 'admin_token';

function readToken(): string | null {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}

interface AdminAuthCtx {
  isAdmin: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthCtx>({
  isAdmin: false,
  token: null,
  login: () => {},
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);

  const login = useCallback((t: string) => {
    try { sessionStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    setToken(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin: token !== null, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
