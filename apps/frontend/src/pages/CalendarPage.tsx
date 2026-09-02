import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarPlus,
  MapPin,
  Clock,
  Trophy,
  Plus,
  X,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { getEvents, createEvent, CalendarEvent } from '../services/api';

const CATEGORIES = ['Partido', 'Entrenamiento', 'Torneo', 'Otro'];

const seedEvents: CalendarEvent[] = [
  {
    id: 'seed-1',
    title: 'Partido Oficial vs San Lorenzo',
    description: '',
    startDate: '2026-09-15T18:00:00',
    endDate: '2026-09-15T20:00:00',
    location: 'Estadio Principal SVC',
    category: 'Partido',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Entrenamiento Intensivo Sub-18',
    description: '',
    startDate: '2026-09-17T19:30:00',
    endDate: '2026-09-17T21:00:00',
    location: 'Cancha 2',
    category: 'Entrenamiento',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Torneo Abierto de Primavera',
    description: '',
    startDate: '2026-09-24T09:00:00',
    endDate: '2026-09-24T18:00:00',
    location: 'Polideportivo Municipal',
    category: 'Torneo',
    createdAt: new Date().toISOString(),
  },
];

const formatDay = (iso: string) => {
  const d = new Date(iso);
  const s = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

const isMatch = (category: string) => category.toLowerCase().includes('partido');

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(seedEvents);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    getEvents()
      .then((data) => {
        setEvents(data.length ? data : seedEvents);
      })
      .catch(() => {
        // Modo offline / backend inalcanzable: se conservan los eventos locales.
      })
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openModal = () => {
    const now = new Date();
    setDate(now.toISOString().slice(0, 10));
    setStartTime('18:00');
    setEndTime('20:00');
    setTitle('');
    setCategory(CATEGORIES[0]);
    setLocation('');
    setDescription('');
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime) {
      showToast('Completa al menos título, fecha y horario de inicio', 'error');
      return;
    }

    const startDate = `${date}T${startTime}`;
    const endDate = `${date}T${endTime || startTime}`;
    const payload = {
      title: title.trim(),
      category,
      startDate,
      endDate,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
    };

    setSaving(true);
    try {
      const created = await createEvent(payload);
      setEvents((prev) => [created, ...prev.filter((ev) => ev.id.startsWith('seed-'))]);
      showToast('Evento agregado al calendario', 'success');
    } catch {
      const local: CalendarEvent = {
        id: `local-${Date.now()}`,
        title: payload.title,
        description: payload.description || null,
        startDate: payload.startDate,
        endDate: payload.endDate,
        location: payload.location || null,
        category: payload.category || 'Otro',
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [local, ...prev]);
      showToast('Evento guardado localmente (sin conexión)', 'info');
    } finally {
      setSaving(false);
      setModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all border-l-4 ${
            toast.type === 'success'
              ? 'bg-svc-card border-svc-brightGreen text-white'
              : toast.type === 'error'
              ? 'bg-svc-card border-svc-red text-white'
              : 'bg-svc-card border-blue-500 text-white'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="text-svc-brightGreen w-6 h-6" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-svc-card p-6 rounded-2xl border border-svc-border">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-svc-brightGreen" />
            <span>Calendario de Partidos y Eventos</span>
          </h1>
          <p className="text-sm text-svc-muted mt-1">Próximos compromisos y entrenamientos programados</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-svc-green hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Evento</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-svc-brightGreen animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full text-center text-svc-muted italic py-16 bg-svc-card border border-svc-border rounded-2xl">
              No hay eventos programados. Usá «Nuevo Evento» para agregar el primero.
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className="bg-svc-card border border-svc-border p-6 rounded-2xl space-y-4 hover:border-svc-green transition-all shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      isMatch(evt.category)
                        ? 'bg-svc-red/20 text-red-400'
                        : 'bg-svc-green/20 text-svc-brightGreen'
                    }`}
                  >
                    {evt.category}
                  </span>
                  {isMatch(evt.category) && <Trophy className="w-5 h-5 text-yellow-500" />}
                </div>

                <h3 className="text-lg font-bold text-white">{evt.title}</h3>

                <div className="space-y-2 text-xs text-svc-muted">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-svc-brightGreen shrink-0" />
                    <span className="capitalize">{formatDay(evt.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>
                      {formatTime(evt.startDate)} hs{evt.endDate !== evt.startDate ? ` - ${formatTime(evt.endDate)} hs` : ''}
                    </span>
                  </div>
                  {evt.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{evt.location}</span>
                    </div>
                  )}
                  {evt.description && (
                    <p className="pt-1 border-t border-svc-input text-gray-300 leading-relaxed">{evt.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Nuevo Evento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} />
          <div className="relative bg-svc-card border border-svc-border p-6 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarPlus className="w-6 h-6 text-svc-brightGreen" />
                <span>Nuevo Evento</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-svc-muted hover:text-white p-1.5 rounded-lg hover:bg-svc-input transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Partido amistoso vs Huracán"
                  className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Categoría / Tipo</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green [color-scheme:dark]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Inicio</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Ubicación</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Estadio Principal SVC"
                  className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detalles del evento (opcional)"
                  className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-svc-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Guardar Evento</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};