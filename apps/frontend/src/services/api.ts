// Todos los endpoints del sistema SVC centralizados aqui.
// VITE_API_URL se define en .env para apuntar al backend NestJS.
// En dev vacio = misma origin (proxy o backend integrado).
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

// --- Tipos ---

export interface RecentAttendance {
  nombre: string
  codigo: string
  hora: string
}

export interface CheckInResponse {
  nombre: string
}

export interface StatsResponse {
  total_jugadores: number
  asistencias_hoy: number
}

// --- Asistencias ---

export async function getRecentAttendances(): Promise<RecentAttendance[]> {
  const res = await fetch(`${BASE_URL}/asistencias/recientes`)
  if (!res.ok) throw new Error('Error al obtener historial de asistencias')
  return res.json()
}

export async function checkIn(codigo: string): Promise<CheckInResponse> {
  const res = await fetch(`${BASE_URL}/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codigo }),
  })
  if (!res.ok) throw new Error('Error en el servidor al registrar asistencia')
  return res.json()
}

// --- Jugadores ---

export async function verifyPlayer(codigo: string): Promise<{ existe: boolean }> {
  const res = await fetch(`${BASE_URL}/verificar/${codigo}`)
  if (!res.ok) throw new Error('Codigo no encontrado')
  return res.json()
}

// --- Metricas ---

export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${BASE_URL}/stats`)
  if (!res.ok) throw new Error('Error al obtener estadisticas')
  return res.json()
}
