interface StatCardProps {
  label: string
  value: number | string
  icon: string
  accent?: 'verde' | 'rojo'
}

const ACCENT_CLASSES: Record<string, string> = {
  verde: 'text-verde-brillante',
  rojo: 'text-rojo-svc',
}

export function StatCard({ label, value, icon, accent = 'verde' }: StatCardProps) {
  return (
    <div className="bg-gris-card border border-gris-borde rounded-2xl p-6 flex items-center gap-5">
      <span className="text-4xl">{icon}</span>
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${ACCENT_CLASSES[accent]}`}>{value}</p>
      </div>
    </div>
  )
}
