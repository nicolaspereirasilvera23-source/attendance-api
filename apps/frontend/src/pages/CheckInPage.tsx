import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CodeInput } from '../components/check-in/CodeInput'
import { AttendanceHistory } from '../components/check-in/AttendanceHistory'
import { ToastList } from '../components/ui/ToastList'
import { OfflineBanner } from '../components/ui/OfflineBanner'
import { useToast } from '../hooks/useToast'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useOfflineSync } from '../hooks/useOfflineSync'
import { getRecentAttendances, verifyPlayer, checkIn } from '../services/api'
import { enqueuePendingCheckIn, getPendingCheckIns } from '../db/offlineQueue'
import type { RecentAttendance } from '../services/api'

export function CheckInPage() {
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [historialLoading, setHistorialLoading] = useState(true)
  const [attendances, setAttendances] = useState<RecentAttendance[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const { toasts, addToast } = useToast()
  const isOnline = useOnlineStatus()

  // Carga inicial del historial del dia
  useEffect(() => {
    let cancelled = false
    getRecentAttendances()
      .then((data) => { if (!cancelled) setAttendances(data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setHistorialLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Mantiene el contador de pendientes actualizado (llamado desde eventos, no desde effect)
  const refreshPendingCount = useCallback(async () => {
    const pending = await getPendingCheckIns()
    setPendingCount(pending.length)
  }, [])

  // Carga inicial del contador de pendientes — logica dentro del effect para evitar re-renders
  useEffect(() => {
    let cancelled = false
    getPendingCheckIns()
      .then((pending) => { if (!cancelled) setPendingCount(pending.length) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Sincronizacion automatica al recuperar conexion
  useOfflineSync(async (count) => {
    addToast(`${count} asistencia${count > 1 ? 's' : ''} sincronizada${count > 1 ? 's' : ''} con exito`, 'success')
    await refreshPendingCount()
    // Refrescar historial con los datos reales del servidor
    getRecentAttendances().then(setAttendances).catch(() => {})
  })

  async function refreshAttendances() {
    try {
      const data = await getRecentAttendances()
      setAttendances(data)
    } catch {
      // silencioso — el check-in ya fue procesado
    }
  }

  async function handleCheckIn() {
    if (!/^\d{4}$/.test(codigo)) {
      addToast('Ingresa un codigo valido de 4 digitos', 'error')
      return
    }

    setLoading(true)
    try {
      if (!isOnline) {
        // Modo offline: guardar en IndexedDB y notificar
        await enqueuePendingCheckIn(codigo)
        await refreshPendingCount()
        addToast('Asistencia guardada localmente (Modo Offline)', 'info')
        setCodigo('')
        return
      }

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
      // Si falla la conexion estando "online", guardar offline como fallback
      await enqueuePendingCheckIn(codigo)
      await refreshPendingCount()
      addToast('Sin conexion — asistencia guardada localmente', 'info')
      setCodigo('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-negro flex flex-col items-center justify-center px-5 py-10">
      <ToastList toasts={toasts} />

      <img src="/svc.png" alt="Logo Suarez Voley Club" className="w-36 mb-5" />

      <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />

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
        Ver Dashboard →
      </Link>
    </div>
  )
}