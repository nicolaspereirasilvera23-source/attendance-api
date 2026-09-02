// Todos los endpoints del sistema SVC centralizados aqui.
// VITE_API_URL se define en .env para apuntar al backend NestJS.
// En dev vacio = misma origin (proxy o backend integrado).
const BASE_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL ?? '';

// --- Tipos ---

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  category: string;
  createdAt: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  category?: string;
}

// --- Calendario / Eventos ---

export async function getEvents(): Promise<CalendarEvent[]> {
  const res = await fetch(`${BASE_URL}/api/calendar`);
  if (!res.ok) throw new Error('Error al obtener eventos');
  return res.json();
}

export async function createEvent(input: CreateEventInput): Promise<CalendarEvent> {
  const res = await fetch(`${BASE_URL}/api/calendar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('svc_token') ? { Authorization: `Bearer ${localStorage.getItem('svc_token')}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Error al crear el evento');
  return res.json();
}
