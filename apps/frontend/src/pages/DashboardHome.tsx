import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, UserCheck, Calendar, Trophy, ArrowUpRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePwaInstall } from '../hooks/usePwaInstall';

const mockWeeklyData = [
  { day: 'Lun', asistencias: 34 },
  { day: 'Mar', asistencias: 42 },
  { day: 'Mié', asistencias: 38 },
  { day: 'Jue', asistencias: 51 },
  { day: 'Vie', asistencias: 46 },
  { day: 'Sáb', asistencias: 60 },
  { day: 'Dom', asistencias: 20 },
];

export const DashboardHome: React.FC = () => {
  const { isInstalled, isInstalling, promptInstall } = usePwaInstall();

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-svc-card p-6 rounded-2xl border border-svc-border">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel Principal - Suárez Voley Club</h1>
          <p className="text-sm text-svc-muted mt-1">
            Resumen de asistencias semanales, próximos partidos y métricas de rendimiento.
          </p>
          {isInstalled && (
            <p className="text-xs text-svc-brightGreen font-semibold mt-2">
              SVC instalada como app - abrila directamente desde tu escritorio.
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={promptInstall}
            disabled={isInstalling}
            title={isInstalled ? 'SVC ya está instalada' : 'Descargar e instalar la app de SVC'}
            className="inline-flex items-center justify-center gap-2 border border-svc-green text-svc-brightGreen hover:bg-svc-green/10 font-bold px-5 py-3 rounded-xl transition-all disabled:opacity-60"
          >
            <Download className="w-5 h-5" />
            <span>{isInstalling ? 'Instalando...' : 'Download SVC'}</span>
          </button>
          <Link
            to="/kiosco"
            className="inline-flex items-center gap-2 bg-svc-green hover:bg-green-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-green-950/30"
          >
            <span>Abrir Kiosco Check-In</span>
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-svc-card border border-svc-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-svc-muted font-semibold uppercase">Jugadores Hoy</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">46</h3>
            <span className="text-xs text-svc-brightGreen font-medium mt-1 inline-block">+12% vs semana pasada</span>
          </div>
          <div className="bg-svc-green/20 p-3.5 rounded-xl text-svc-brightGreen">
            <UserCheck className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-svc-card border border-svc-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-svc-muted font-semibold uppercase">Total Jugadores</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">128</h3>
            <span className="text-xs text-blue-400 font-medium mt-1 inline-block">Activos en el club</span>
          </div>
          <div className="bg-blue-500/20 p-3.5 rounded-xl text-blue-400">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-svc-card border border-svc-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-svc-muted font-semibold uppercase">Próximo Partido</p>
            <h3 className="text-xl font-bold text-white mt-1">vs S. Lorenzo</h3>
            <span className="text-xs text-yellow-400 font-medium mt-1 inline-block">Sábado 18:00 hs</span>
          </div>
          <div className="bg-yellow-500/20 p-3.5 rounded-xl text-yellow-400">
            <Trophy className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-svc-card border border-svc-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-svc-muted font-semibold uppercase">Promedio Semanal</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">41.5</h3>
            <span className="text-xs text-purple-400 font-medium mt-1 inline-block">Jugadores / día</span>
          </div>
          <div className="bg-purple-500/20 p-3.5 rounded-xl text-purple-400">
            <Calendar className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Gráfico de Asistencias */}
      <div className="bg-svc-card border border-svc-border p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-6">Asistencia de Jugadores en la Semana</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockWeeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="day" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="asistencias" fill="#006837" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
