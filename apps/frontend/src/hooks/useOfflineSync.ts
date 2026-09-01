import { useEffect, useRef } from 'react'
import { getPendingCheckIns, markAsSynced } from '../db/offlineQueue'
import { checkIn } from '../services/api'

// Escucha el evento 'online' y envia en batch los check-ins acumulados offline.
// El endpoint POST /check-in/batch-sync se implementa en el backend (NestJS/Grok).
// Mientras ese endpoint no exista, el fallback es enviar de a uno con POST /check-in.
export function useOfflineSync(onSynced?: (count: number) => void) {
  const isSyncing = useRef(false)

  useEffect(() => {
    async function syncPendingCheckIns() {
      if (isSyncing.current) return
      isSyncing.current = true

      try {
        const pending = await getPendingCheckIns()
        if (pending.length === 0) return

        const syncedIds: number[] = []

        for (const record of pending) {
          try {
            await checkIn(record.codigo)
            if (record.id !== undefined) syncedIds.push(record.id)
          } catch {
            // Si falla uno, continuamos con el resto
          }
        }

        if (syncedIds.length > 0) {
          await markAsSynced(syncedIds)
          onSynced?.(syncedIds.length)
        }
      } finally {
        isSyncing.current = false
      }
    }

    window.addEventListener('online', syncPendingCheckIns)
    // Intentar sync inmediato si ya hay conexion al montar el componente
    if (navigator.onLine) syncPendingCheckIns()

    return () => window.removeEventListener('online', syncPendingCheckIns)
  }, [onSynced])
}