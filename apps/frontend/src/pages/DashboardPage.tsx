import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../components/dashboard/StatCard'
import { WeeklyChart } from '../components/dashboard/WeeklyChart'
import { getStats } from '../services/api'
import type { StatsResponse } from '../services/api'

export function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-negro text-white px-5 py-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src="/svc.png" alt="Logo SVC" className="w-10" />
          <div>
            <h1 className="text-lg font-bold tracking-wide">Suarez Voley Club</h1>
            <p className="text-xs text-gray-500">Panel de administracion</p>
          </div>
        </div>
        <Link
          to="/check-in"
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #be1e2d, #900)' }}
        >
          Check-In ?
        </Link>
      </div>

      {/* Tarjetas de metricas */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[0, 1].map((i) => (
            <div key={i} className="bg-gris-card border border-gris-borde rounded-2xl p-6 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard
            label="Jugadores activos"
            value={stats?.total_jugadores ?? 0}
            icon="??"
            accent="verde"
          />
          <StatCard
            label="Asistencias hoy"
            value={stats?.asistencias_hoy ?? 0}
            icon="?"
            accent="verde"
          />
        </div>
      )}

      {/* Grafico semanal */}
      <WeeklyChart />
    </div>
  )
}
