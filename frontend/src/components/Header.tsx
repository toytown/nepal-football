import { useState } from 'react';
import { useAdminAuth } from '../hooks/AdminAuthContext';
import LoginModal from './LoginModal';

export default function Header() {
  const { isAdmin, logout } = useAdminAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <div className="header-top">
        <div className="header-flag" aria-label="Nepal flag">🇳🇵</div>
        <div className="header-titles">
          <div className="header-eyebrow">Event Manager Dashboard</div>
          <h1 className="header-title">
            Nepali <span>Europapokal</span> 2026
          </h1>
        </div>
        <div className="header-right">
          <div className="header-meta">
            📍 Sportanlage Grüngürtel, Berlin
            <br />
            📅 04–05 July 2026
          </div>
          {isAdmin ? (
            <button
              className="auth-btn auth-btn-logout"
              onClick={logout}
              aria-label="Log out of admin"
            >
              🔓 Logout
            </button>
          ) : (
            <button
              className="auth-btn auth-btn-login"
              onClick={() => setLoginOpen(true)}
              aria-label="Admin login"
            >
              🔐 Admin
            </button>
          )}
        </div>
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
