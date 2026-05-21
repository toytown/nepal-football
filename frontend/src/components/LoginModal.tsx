import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api/client';
import { useAdminAuth } from '../hooks/AdminAuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus username field when modal opens; clear state when it closes
  useEffect(() => {
    if (isOpen) {
      setUsername(''); setPassword(''); setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });
      login(res.token);
      onClose();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Admin login"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">🔐 Admin Login</span>
          <button className="modal-close" onClick={onClose} aria-label="Close login">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="reg-field">
            <label className="reg-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              ref={inputRef}
              className="reg-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="reg-field">
            <label className="reg-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="reg-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="reg-error" role="alert" style={{ marginBottom: 12 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="reg-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
