import Dexie, { Table } from 'dexie';

export interface OfflineAttendance {
  id?: number;
  codigo: string;
  nombre?: string;
  timestamp: string;
  synced: boolean;
}

export class SVCDatabase extends Dexie {
  attendances!: Table<OfflineAttendance>;

  constructor() {
    super('SVCDatabase');
    this.version(1).stores({
      attendances: '++id, codigo, timestamp, synced'
    });
  }
}

export const offlineDb = new SVCDatabase();
