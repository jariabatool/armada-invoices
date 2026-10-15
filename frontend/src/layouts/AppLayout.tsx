import { NavLink, Outlet } from "react-router";
import { FileText, LogOut, Users } from "lucide-react";
import { useAuth } from "../context/auth/useAuth";
import { Avatar } from "../components/ui/Avatar";
import { Logo } from "../components/ui/Logo";

const NAV_ITEMS = [
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/clients", label: "Clients", icon: Users },
] as const;

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <Logo />
        </div>
        <nav className="sidebar__nav" aria-label="Main">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar__link${isActive ? " is-active" : ""}`}>
              <Icon size={18} aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-shell__main">
        <header className="topbar">
          {user && (
            <div className="topbar__user">
              <Avatar name={user.name} src={user.avatarUrl} size={36} />
              <div className="topbar__user-text">
                <span className="topbar__user-name">{user.name}</span>
                <span className="topbar__user-email">{user.email}</span>
              </div>
              <button type="button" className="icon-button" onClick={logout} aria-label="Log out" title="Log out">
                <LogOut size={18} aria-hidden />
              </button>
            </div>
          )}
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
