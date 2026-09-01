import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

// Datos estaticos de placeholder hasta que el backend exponga GET /stats/semana
const MOCK_DATA = [
  { dia: 'Lun', asistencias: 12 },
  { dia: 'Mar', asistencias: 8 },
  { dia: 'Mie', asistencias: 15 },
  { dia: 'Jue', asistencias: 5 },
  { dia: 'Vie', asistencias: 18 },
  { dia: 'Sab', asistencias: 10 },
  { dia: 'Dom', asistencias: 3 },
]

export function WeeklyChart() {
  return (
    <div className="bg-gris-card border border-gris-borde rounded-2xl p-6">
      <h2 className="text-sm text-gray-500 uppercase tracking-widest mb-5">
        Asistencias esta semana
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={MOCK_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="dia" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: 8 }}
            labelStyle={{ color: '#ccc' }}
            itemStyle={{ color: '#2ecc71' }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="asistencias" fill="#006837" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
