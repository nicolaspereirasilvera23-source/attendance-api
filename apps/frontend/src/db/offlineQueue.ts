import Dexie, { type Table } from 'dexie'

// Registro de asistencia capturada sin conexion a internet
export interface PendingCheckIn {
  id?: number        // autoincrement — clave primaria de IndexedDB
  codigo: string
  timestamp: number  // Date.now() al momento del check-in
  synced: boolean
}

class OfflineDatabase extends Dexie {
  pendingCheckIns!: Table<PendingCheckIn>

  constructor() {
    super('svc-offline-db')
    this.version(1).stores({
      // ++ = autoincrement, codigo e synced son campos indexados
      pendingCheckIns: '++id, codigo, synced',
    })
  }
}

export const db = new OfflineDatabase()

export async function enqueuePendingCheckIn(codigo: string): Promise<void> {
  await db.pendingCheckIns.add({ codigo, timestamp: Date.now(), synced: false })
}

export async function getPendingCheckIns(): Promise<PendingCheckIn[]> {
  return db.pendingCheckIns.where('synced').equals(0).toArray()
}

export async function markAsSynced(ids: number[]): Promise<void> {
  await db.pendingCheckIns.where('id').anyOf(ids).modify({ synced: true })
}