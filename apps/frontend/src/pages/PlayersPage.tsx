import React, { useState, useEffect } from 'react';
import { offlineDb, generateOfflinePin, OfflinePlayer } from '../db/indexedDb';
import { Users, UserPlus, Key, Wifi, WifiOff, CheckCircle, RefreshCw, Shield } from 'lucide-react';

const SQUAD_OPTIONS = [
  'Masculino A',
  'Masculino B',
  'Femenino'
];

export const PlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<Array<{ id?: string; code: string; name: string; age: number; squad: string; timeInClub: number }>>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [squad, setSquad] = useState('Masculino A');
  const [timeInClub, setTimeInClub] = useState<number | ''>('');
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadPlayers();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadPlayers = async () => {
    try {
      const res = await fetch('/api/jugadores/');
      if (res.ok) {
        const data = await res.json();
        setPlayers(data);
        return;
      }
    } catch (err) {
      console.warn('Cargando jugadores desde IndexedDB (Modo Offline)');
    }

    // Fallback IndexedDB
    const localPlayers = await offlineDb.players.toArray();
    setPlayers(
      localPlayers.map((p) => ({
        code: p.code,
        name: p.name,
        age: p.age,
        squad: p.squad || 'Sin Plantel',
        timeInClub: p.timeInClub
      }))
    );
  };

  const handleRegisterPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !timeInClub) {
      showToast('Completa todos los campos del jugador', 'error');
      return;
    }

    setLoading(true);

    try {
      if (!isOnline) {
        // Generación de PIN offline en IndexedDB con asignación de Plantel
        const pin = await generateOfflinePin();
        const newOfflinePlayer: OfflinePlayer = {
          code: pin,
          name: name.trim(),
          age: Number(age),
          squad: squad,
          timeInClub: Number(timeInClub),
          createdAt: new Date().toISOString(),
          synced: false
        };

        await offlineDb.players.add(newOfflinePlayer);
        setGeneratedPin(pin);
        showToast(`Jugador guardado en Plantel ${squad} (PIN: ${pin})`, 'success');
        await loadPlayers();
      } else {
        // Envío directo a NestJS API
        const res = await fetch('/api/jugadores/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: name.trim(),
            edad: Number(age),
            plantel: squad,
            tiempo: Number(timeInClub)
          })
        });

        const data = await res.json();

        if (res.ok) {
          setGeneratedPin(data.codigo);
          showToast(`Jugador registrado en ${squad} (PIN: ${data.codigo})`, 'success');
          await loadPlayers();
        } else {
          showToast(data.detail || 'Error registrando jugador', 'error');
        }
      }

      // Reset Form Inputs
      setName('');
      setAge('');
      setTimeInClub('');
    } catch (err) {
      showToast('Error en la generación del PIN local', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-svc-card p-6 rounded-2xl border border-svc-border">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-svc-brightGreen" />
            <span>Gestión de Jugadores, Planteles y PINs</span>
          </h1>
          <p className="text-sm text-svc-muted mt-1">
            Asignación de jugadores por Plantel y generación automática de PINs (Online & Offline PWA)
          </p>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border ${
            isOnline
              ? 'bg-svc-green/20 border-svc-green text-svc-brightGreen'
              : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
          }`}
        >
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span>{isOnline ? 'SISTEMA ONLINE' : 'PINS OFFLINE INDEXEDDB'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Alta con PIN Generator */}
        <div className="bg-svc-card border border-svc-border p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-svc-border pb-3">
            <UserPlus className="w-5 h-5 text-svc-brightGreen" />
            <span>Registrar en Plantel</span>
          </h3>

          {generatedPin && (
            <div className="bg-svc-green/20 border border-svc-green text-svc-brightGreen p-4 rounded-xl text-center space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider">Último PIN Asignado:</span>
              <h2 className="text-3xl font-extrabold tracking-[0.2em] font-mono text-white">{generatedPin}</h2>
            </div>
          )}

          <form onSubmit={handleRegisterPlayer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Mateo González"
                className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Plantel / Categoría</label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-3.5 text-svc-muted" />
                <select
                  value={squad}
                  onChange={(e) => setSquad(e.target.value)}
                  className="w-full bg-svc-input border border-svc-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green"
                >
                  {SQUAD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Edad</label>
                <input
                  type="number"
                  required
                  min={5}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder="17"
                  className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">Meses en Club</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={600}
                  value={timeInClub}
                  onChange={(e) => setTimeInClub(e.target.value ? Number(e.target.value) : '')}
                  placeholder="12"
                  className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-svc-green hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Generar PIN y Guardar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lista de Jugadores & PINs con Plantel */}
        <div className="lg:col-span-2 bg-svc-card border border-svc-border p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center justify-between border-b border-svc-border pb-3">
            <span>Jugadores Registrados por Plantel</span>
            <span className="text-xs bg-svc-input text-svc-muted px-3 py-1 rounded-full">{players.length} Jugadores</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-svc-muted uppercase bg-svc-input/50">
                <tr>
                  <th className="p-3 rounded-l-xl">PIN</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Plantel</th>
                  <th className="p-3">Edad</th>
                  <th className="p-3 rounded-r-xl">Permanencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-svc-input">
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-svc-muted italic">
                      No hay jugadores registrados en el sistema
                    </td>
                  </tr>
                ) : (
                  players.map((p, i) => (
                    <tr key={i} className="hover:bg-svc-input/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-svc-brightGreen">#{p.code}</td>
                      <td className="p-3 font-medium text-white">{p.name}</td>
                      <td className="p-3">
                        <span className="bg-svc-green/20 text-svc-brightGreen border border-svc-green/30 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          {p.squad}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300">{p.age} años</td>
                      <td className="p-3 text-gray-300">{p.timeInClub} meses</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
