import React from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Trophy } from 'lucide-react';

const mockEvents = [
  {
    id: '1',
    title: 'Partido Oficial vs San Lorenzo',
    date: '15 de Septiembre, 2026',
    time: '18:00 hs',
    location: 'Estadio Principal SVC',
    type: 'Partido'
  },
  {
    id: '2',
    title: 'Entrenamiento Intensivo Sub-18',
    date: '17 de Septiembre, 2026',
    time: '19:30 hs',
    location: 'Cancha 2',
    type: 'Entrenamiento'
  },
  {
    id: '3',
    title: 'Torneo Abierto de Primavera',
    date: '24 de Septiembre, 2026',
    time: '09:00 hs',
    location: 'Polideportivo Municipal',
    type: 'Torneo'
  }
];

export const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-svc-brightGreen" />
            <span>Calendario de Partidos y Eventos</span>
          </h1>
          <p className="text-sm text-svc-muted mt-1">Próximos compromisos y entrenamientos programados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((evt) => (
          <div key={evt.id} className="bg-svc-card border border-svc-border p-6 rounded-2xl space-y-4 hover:border-svc-green transition-all shadow-xl">
            <div className="flex justify-between items-start">
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                evt.type === 'Partido' ? 'bg-svc-red/20 text-red-400' : 'bg-svc-green/20 text-svc-brightGreen'
              }`}>
                {evt.type}
              </span>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>

            <h3 className="text-lg font-bold text-white">{evt.title}</h3>

            <div className="space-y-2 text-xs text-svc-muted">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-svc-brightGreen" />
                <span>{evt.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{evt.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>{evt.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
