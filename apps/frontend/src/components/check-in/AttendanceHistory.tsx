import type { RecentAttendance } from '../../services/api'

function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

interface AttendanceHistoryProps {
  attendances: RecentAttendance[]
  loading: boolean
}

export function AttendanceHistory({ attendances, loading }: AttendanceHistoryProps) {
  return (
    <div className="mt-7 pt-5 border-t border-gris-borde text-left">
      <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">
        Ultimos ingresos
      </h3>

      {loading ? (
        <p className="text-gray-600 text-sm">Cargando...</p>
      ) : attendances.length === 0 ? (
        <p className="text-gray-600 text-sm" data-testid="historial-vacio">
          Aun no hay ingresos hoy
        </p>
      ) : (
        <ul data-testid="historial-list" className="space-y-2">
          {attendances.map((item, i) => (
            <li
              key={i}
              className="flex justify-between items-center py-2 border-b border-gris-input last:border-none text-sm text-gray-300"
            >
              <span>
                {capitalize(item.nombre)}{' '}
                <span className="text-gray-500">(#{item.codigo})</span>
              </span>
              <span className="bg-gris-borde text-gray-400 text-xs px-2 py-0.5 rounded">
                {item.hora}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
