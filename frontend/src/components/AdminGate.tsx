import { useState } from 'react';
import { useAdminAuth } from '../hooks/AdminAuthContext';
import LoginModal from './LoginModal';

/**
 * Renders a subtle read-only notice when the user is not an admin.
 * Includes a "Login to edit" link that opens the LoginModal inline.
 * Renders nothing when the user is already an admin.
 */
export default function AdminGate() {
  const { isAdmin } = useAdminAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  if (isAdmin) return null;

  return (
    <>
      <div className="admin-gate" role="status">
        <span className="admin-gate-icon">🔒</span>
        <span className="admin-gate-text">View only —</span>
        <button
          className="admin-gate-link"
          onClick={() => setLoginOpen(true)}
        >
          log in to edit
        </button>
      </div>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
