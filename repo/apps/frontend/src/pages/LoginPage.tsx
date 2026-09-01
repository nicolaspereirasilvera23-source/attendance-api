import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulación / Conexión a NestJS /api/auth/login
      const mockToken = 'mock_jwt_token_svc_2026';
      const mockUser = {
        id: '1',
        name: 'Entrenador Suárez',
        email,
        role: 'ADMIN' as const
      };

      setAuth(mockToken, mockUser);
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-svc-bg p-4">
      <div className="w-full max-w-md bg-svc-card border border-svc-border p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src="/svc.png" alt="Suarez Voley Club Logo" className="h-20 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-2">Ingresar al Sistema</h2>
        <p className="text-sm text-center text-svc-muted mb-6">Panel Administrativo Suárez Voley Club</p>

        {error && (
          <div className="bg-svc-red/20 border border-svc-red text-red-300 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-svc-muted mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-svc-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="entrenador@suarezvoley.com"
                className="w-full bg-svc-input border border-svc-border rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-svc-green"
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
                className="w-full bg-svc-input border border-svc-border rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-svc-green"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-svc-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
