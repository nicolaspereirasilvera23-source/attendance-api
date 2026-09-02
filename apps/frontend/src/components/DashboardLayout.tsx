import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, KeyRound, LogOut, User, Users, Menu, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('svc.sidebar.collapsed') === '1');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Check-In Kiosco', path: '/kiosco', icon: KeyRound },
    { label: 'Jugadores & PINs', path: '/jugadores', icon: Users },
    { label: 'Tablero Kanban', path: '/kanban', icon: CheckSquare },
    { label: 'Calendario', path: '/calendario', icon: Calendar },
  ];

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem('svc.sidebar.collapsed', next ? '1' : '0');
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex h-screen bg-svc-bg overflow-hidden">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-svc-border bg-svc-card p-4 transition-all duration-300 w-64 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${collapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        <div>
          {/* Logo Brand */}
          <div className="flex items-center justify-between gap-3 px-3 py-4 mb-6 border-b border-svc-border">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/svc.png" alt="Logo SVC" className={`h-10 w-10 object-contain shrink-0 ${collapsed ? 'md:mx-auto' : ''}`} />
              <div className={collapsed ? 'md:hidden' : ''}>
                <h2 className="text-sm font-bold text-white tracking-wide">SUÁREZ VOLEY</h2>
                <span className="text-[10px] text-svc-brightGreen font-semibold tracking-widest uppercase">System Web</span>
              </div>
            </div>
            <button
              onClick={closeMobile}
              className="md:hidden text-svc-muted hover:text-white p-1.5 rounded-lg hover:bg-svc-input transition-colors"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    collapsed ? 'md:justify-center md:px-0' : ''
                  } ${
                    isActive
                      ? 'bg-svc-green text-white shadow-lg shadow-green-950/40'
                      : 'text-svc-muted hover:bg-svc-input hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl text-svc-muted hover:bg-svc-input hover:text-white transition-all mb-3"
        >
          {collapsed ? (
            <ChevronsRight className="w-5 h-5 mx-auto" />
          ) : (
            <>
              <ChevronsLeft className="w-5 h-5" />
              <span>Contraer panel</span>
            </>
          )}
        </button>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-svc-border">
          <div className={`flex items-center px-3 py-2 ${collapsed ? 'justify-center md:px-0' : 'justify-between'}`}>
            <div className={`flex items-center gap-2.5 ${collapsed ? 'flex-col md:gap-1' : ''} min-w-0`}>
              <div className="bg-svc-input p-2 rounded-full text-svc-brightGreen shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className={`truncate ${collapsed ? 'md:hidden' : ''}`}>
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Usuario'}</p>
                <p className="text-[10px] text-svc-muted truncate">{user?.email || 'admin@svc.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-svc-muted hover:text-svc-red p-1.5 rounded-lg hover:bg-svc-input transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 p-4 bg-svc-card border-b border-svc-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-svc-muted hover:text-white p-1.5 rounded-lg hover:bg-svc-input transition-colors"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/svc.png" alt="Logo SVC" className="h-8 w-8 object-contain" />
          <span className="text-sm font-bold text-white tracking-wide">SUÁREZ VOLEY</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};