import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, ListChecks, LogOut, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/check-in', label: 'Check-in', icon: ListChecks },
  { to: '/goals', label: 'Week', icon: Target },
  { to: '/skills', label: 'Skills', icon: Sparkles },
  { to: '/wins', label: 'Wins', icon: BookOpen },
];

function linkClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-sm px-3 py-2 text-[13px] font-medium transition-colors',
    isActive ? 'bg-paper text-ink' : 'text-ink-soft hover:text-ink',
  ].join(' ');
}

function mobileLinkClass({ isActive }) {
  return [
    'flex flex-col items-center gap-1 px-2 py-2 text-[11px] font-medium',
    isActive ? 'text-accent' : 'text-muted',
  ].join(' ');
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line px-4 py-6 md:flex">
          <div className="px-2">
            <p className="font-display text-2xl tracking-tight">Attache</p>
            <p className="mt-1 text-xs text-muted">{user?.organization || 'Attachee / intern'}</p>
          </div>
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                <link.icon size={18} strokeWidth={1.75} />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-line pt-4">
            <NavLink to="/settings" className={linkClass}>
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-paper text-[11px] font-medium text-ink">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </span>
              <span className="min-w-0">
                <span className="block truncate">{user?.name}</span>
                <span className="block truncate text-xs font-normal text-muted">Settings</span>
              </span>
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="mt-1 flex w-full items-center gap-3 rounded-sm px-3 py-2 text-[13px] text-muted hover:text-ink"
            >
              <LogOut size={18} strokeWidth={1.75} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:hidden">
            <p className="font-display text-xl">Attache</p>
            <NavLink to="/settings" className="text-xs font-medium text-muted">
              {user?.name?.split(' ')[0]}
            </NavLink>
          </header>

          <main key={location.pathname} className="page-enter flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-10 md:pt-8">
            <Outlet />
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={mobileLinkClass}>
              <link.icon size={18} strokeWidth={1.75} />
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
