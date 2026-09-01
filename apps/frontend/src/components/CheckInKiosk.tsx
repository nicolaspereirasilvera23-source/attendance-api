import React, { useState, useEffect } from 'react';
import { offlineDb, OfflineAttendance } from '../db/indexedDb';
import { Wifi, WifiOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const CheckInKiosk: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [historial, setHistorial] = useState<Array<{ nombre: string; codigo: string; hora: string }>>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    cargarHistorial();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const cargarHistorial = async () => {
    try {
      const res = await fetch('/api/asistencias/recientes');
      if (res.ok) {
        const data = await res.json();
        setHistorial(data);
      }
    } catch (err) {
      console.warn('Modo offline: Cargando asistencias desde IndexedDB');
      const local = await offlineDb.attendances.toArray();
      setHistorial(
        local.map((item) => ({
          nombre: item.nombre || 'Jugador Offline',
          codigo: item.codigo,
          hora: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      );
    }
  };

  const handleCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCodigo = codigo.trim();

    if (!/^\d{4}$/.test(cleanCodigo)) {
      showToast('Ingresa un código válido de 4 dígitos', 'error');
      return;
    }

    setLoading(true);

    if (!isOnline) {
      // Guardar en IndexedDB offline
      await offlineDb.attendances.add({
        codigo: cleanCodigo,
        timestamp: new Date().toISOString(),
        synced: false
      });
      showToast('Asistencia guardada en modo Offline (Se sincronizará al reconectar)', 'info');
      setCodigo('');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: cleanCodigo })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`¡Bienvenido/a ${data.nombre}!`, 'success');
        setCodigo('');
        await cargarHistorial();
      } else {
        showToast(data.message || 'Código no encontrado', 'error');
      }
    } catch (err) {
      // Fallback a almacenamiento offline si falla la conexión
      await offlineDb.attendances.add({
        codigo: cleanCodigo,
        timestamp: new Date().toISOString(),
        synced: false
      });
      showToast('Conexión perdida. Guardado localmente en la PWA.', 'info');
      setCodigo('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4">
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
          {toast.type === 'error' && <AlertCircle className="text-svc-red w-6 h-6" />}
          {toast.type === 'info' && <RefreshCw className="text-blue-400 w-6 h-6 animate-spin" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Connection Indicator Badge */}
      <div
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border ${
          isOnline
            ? 'bg-svc-green/20 border-svc-green text-svc-brightGreen'
            : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
        }`}
      >
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span>{isOnline ? 'CONECTADO A INTERNET' : 'MODO OFFLINE PWA ACTIVO'}</span>
      </div>

      {/* Card Principal de Check-in */}
      <div className="w-full max-w-md bg-svc-card border border-svc-border rounded-2xl p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-4">
          <img src="/svc.png" alt="Suarez Voley Club Logo" className="h-20 object-contain" />
        </div>

        <h1 className="text-2xl font-bold tracking-wider text-white mb-6">CONTROL DE ACCESO</h1>

        <form onSubmit={handleCheckIn} className="space-y-4">
          <input
            type="text"
            data-testid="codigo-input"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ingresa tu código de 4 dígitos"
            maxLength={4}
            inputMode="numeric"
            autoComplete="off"
            className="w-full text-center text-xl tracking-[0.3em] font-mono bg-svc-input border-2 border-svc-border rounded-xl py-3.5 text-white focus:outline-none focus:border-svc-green transition-colors"
          />

          <button
            type="submit"
            data-testid="confirmar-btn"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-svc-red to-red-800 hover:from-red-700 hover:to-svc-red text-white font-bold rounded-xl shadow-lg hover:shadow-red-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span>CONFIRMAR ASISTENCIA</span>
            )}
          </button>
        </form>

        {/* Historial Reciente */}
        <div className="mt-8 pt-6 border-t border-svc-border text-left">
          <h3 className="text-xs font-semibold text-svc-muted uppercase tracking-wider mb-4">
            Últimos Ingresos del Día
          </h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {historial.length === 0 ? (
              <li className="text-sm text-svc-muted italic">Aún no hay ingresos registrados</li>
            ) : (
              historial.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-svc-input text-sm text-gray-200"
                >
                  <span className="font-medium">
                    {item.nombre} <span className="text-svc-muted text-xs">(#{item.codigo})</span>
                  </span>
                  <span className="bg-svc-input text-xs px-2.5 py-1 rounded text-gray-400 font-mono">
                    {item.hora}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
