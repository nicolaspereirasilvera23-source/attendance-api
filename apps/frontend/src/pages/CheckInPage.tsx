import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CodeInput } from '../components/check-in/CodeInput'
import { AttendanceHistory } from '../components/check-in/AttendanceHistory'
import { ToastList } from '../components/ui/ToastList'
import { useToast } from '../hooks/useToast'
import { getRecentAttendances, verifyPlayer, checkIn } from '../services/api'
import type { RecentAttendance } from '../services/api'

export function CheckInPage() {
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [historialLoading, setHistorialLoading] = useState(true)
  const [attendances, setAttendances] = useState<RecentAttendance[]>([])
  const { toasts, addToast } = useToast()

  // Carga inicial — vive dentro del effect para no disparar re-renders extra
  useEffect(() => {
    let cancelled = false
    getRecentAttendances()
      .then((data) => { if (!cancelled) setAttendances(data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setHistorialLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Refresco post-evento (se llama desde handleCheckIn, no desde un effect)
  async function refreshAttendances() {
    try {
      const data = await getRecentAttendances()
      setAttendances(data)
    } catch {
      // silencioso — el check-in ya fue exitoso
    }
  }

  async function handleCheckIn() {
    if (!/^\d{4}$/.test(codigo)) {
      addToast('Ingresa un codigo valido de 4 digitos', 'error')
      return
    }

    setLoading(true)
    try {
      const { existe } = await verifyPlayer(codigo)
      if (!existe) {
        addToast('Codigo no encontrado', 'error')
        return
      }

      const data = await checkIn(codigo)
      addToast(`Bienvenido/a ${data.nombre}`, 'success')
      setCodigo('')
      await refreshAttendances()
    } catch {
      addToast('No se pudo conectar con el servidor', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-negro flex flex-col items-center justify-center px-5 py-10">
      <ToastList toasts={toasts} />

      <img src="/svc.png" alt="Logo Suarez Voley Club" className="w-36 mb-5" />

      <div className="bg-gris-card border border-gris-borde rounded-2xl p-10 w-full max-w-sm shadow-2xl text-center">
        <h1 className="text-lg font-semibold tracking-widest uppercase mb-6 text-white">
          Control de Acceso
        </h1>

        <div className="mb-5">
          <CodeInput
            value={codigo}
            onChange={setCodigo}
            onSubmit={handleCheckIn}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleCheckIn}
          disabled={loading}
          data-testid="confirmar-btn"
          className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide uppercase transition-all active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #be1e2d, #900)' }}
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Confirmar Asistencia'
          )}
        </button>

        <AttendanceHistory attendances={attendances} loading={historialLoading} />
      </div>

      <Link
        to="/dashboard"
        className="mt-6 text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        Ver Dashboard ?
      </Link>
    </div>
  )
}
