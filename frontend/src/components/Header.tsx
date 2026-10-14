import { useAuth } from "../auth/useAuth";

export function Header() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="header">
      <span className="brand">Invoice Tracker</span>
      <div className="user">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="avatar" referrerPolicy="no-referrer" />
        ) : (
          <span className="avatar avatar-fallback">{user.name.charAt(0)}</span>
        )}
        <div className="user-text">
          <strong>{user.name}</strong>
          <span className="muted">{user.email}</span>
        </div>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
