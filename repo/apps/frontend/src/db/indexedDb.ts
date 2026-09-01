import Dexie, { Table } from 'dexie';

export interface OfflineAttendance {
  id?: number;
  codigo: string;
  nombre?: string;
  timestamp: string;
  synced: boolean;
}

export interface OfflinePlayer {
  id?: number;
  code: string; // PIN de 4 dígitos generado offline
  name: string;
  age: number;
  timeInClub: number;
  createdAt: string;
  synced: boolean;
}

export class SVCDatabase extends Dexie {
  attendances!: Table<OfflineAttendance>;
  players!: Table<OfflinePlayer>;

  constructor() {
    super('SVCDatabase');
    this.version(2).stores({
      attendances: '++id, codigo, timestamp, synced',
      players: '++id, &code, name, synced'
    });
  }
}

export const offlineDb = new SVCDatabase();

/**
 * Genera un PIN/código único de 4 dígitos (0000-9999) verificando que no exista en IndexedDB
 */
export async function generateOfflinePin(): Promise<string> {
  const existingPlayers = await offlineDb.players.toArray();
  const existingCodes = new Set(existingPlayers.map((p) => p.code));

  let attempts = 0;
  while (attempts < 1000) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    if (!existingCodes.has(pin)) {
      return pin;
    }
    attempts++;
  }
  throw new Error('No se pudo generar un PIN único offline.');
}
