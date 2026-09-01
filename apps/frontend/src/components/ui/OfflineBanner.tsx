interface OfflineBannerProps {
  isOnline: boolean
  pendingCount: number
}

export function OfflineBanner({ isOnline, pendingCount }: OfflineBannerProps) {
  if (isOnline && pendingCount === 0) return null

  if (!isOnline) {
    return (
      <div
        role="status"
        data-testid="banner-offline"
        className="w-full max-w-sm mb-4 px-4 py-2 rounded-xl bg-yellow-900/40 border border-yellow-700 text-yellow-300 text-xs text-center"
      >
        ⚠ Sin conexion — las asistencias se guardan localmente
        {pendingCount > 0 && (
          <span className="ml-1 font-bold">({pendingCount} pendiente{pendingCount > 1 ? 's' : ''})</span>
        )}
      </div>
    )
  }

  // Online pero con pendientes sincronizando
  return (
    <div
      role="status"
      data-testid="banner-syncing"
      className="w-full max-w-sm mb-4 px-4 py-2 rounded-xl bg-verde-svc/20 border border-verde-svc text-verde-brillante text-xs text-center"
    >
      ↑ Sincronizando {pendingCount} asistencia{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''}...
    </div>
  )
}