import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, KeyRound, LogOut, User, Users } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Check-In Kiosco', path: '/kiosco', icon: KeyRound },
    { label: 'Jugadores & PINs', path: '/jugadores', icon: Users },
    { label: 'Tablero Kanban', path: '/kanban', icon: CheckSquare },
    { label: 'Calendario', path: '/calendario', icon: Calendar },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-svc-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-svc-card border-r border-svc-border flex flex-col justify-between p-4">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-svc-border">
            <img src="/svc.png" alt="Logo SVC" className="h-10 w-10 object-contain" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">SUÁREZ VOLEY</h2>
              <span className="text-[10px] text-svc-brightGreen font-semibold tracking-widest uppercase">System Web</span>
            </div>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-svc-green text-white shadow-lg shadow-green-950/40'
                      : 'text-svc-muted hover:bg-svc-input hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-4 border-t border-svc-border">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2.5">
              <div className="bg-svc-input p-2 rounded-full text-svc-brightGreen">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
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
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};
