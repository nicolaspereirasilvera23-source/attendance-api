import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, StaffType } from '../store/useAuthStore';
import { login } from '../services/api';
import { Lock, Mail, ClipboardList, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffType, setStaffType] = useState<StaffType>('DIRECTOR_TECNICO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password, staffType);
      setAuth(res.access_token, res.user);
      navigate('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al conectar con el servidor',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-svc-bg p-4">
      <div className="w-full max-w-md bg-svc-card border border-svc-border p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="flex justify-center">
          <img src="/svc.png" alt="Suarez Voley Club Logo" className="h-20 object-contain" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Ingresar al Sistema</h2>
          <p className="text-sm text-svc-muted mt-1">Panel de Control Suárez Voley Club</p>
        </div>

        {error && (
          <div className="bg-svc-red/20 border border-svc-red text-red-300 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Selección de Tipo de Staff */}
          <div>
            <label className="block text-xs font-semibold uppercase text-svc-muted mb-2">Rol de Staff</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStaffType('DIRECTOR_TECNICO')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  staffType === 'DIRECTOR_TECNICO'
                    ? 'bg-svc-green/20 border-svc-green text-svc-brightGreen shadow-md'
                    : 'bg-svc-input border-svc-border text-svc-muted hover:text-white'
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                <span>Director Técnico</span>
              </button>

              <button
                type="button"
                onClick={() => setStaffType('ADMINISTRATIVO')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  staffType === 'ADMINISTRATIVO'
                    ? 'bg-svc-green/20 border-svc-green text-svc-brightGreen shadow-md'
                    : 'bg-svc-input border-svc-border text-svc-muted hover:text-white'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Administrativo</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-svc-muted mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-svc-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@suarezvoley.com"
                className="w-full bg-svc-input border border-svc-border rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-svc-green text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-svc-muted mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-svc-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-svc-input border border-svc-border rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-svc-green text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-svc-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
          >
            {loading ? 'Ingresando...' : `Iniciar Sesión como ${staffType === 'DIRECTOR_TECNICO' ? 'DT' : 'Admin'}`}
          </button>
        </form>
      </div>
    </div>
  );
};
