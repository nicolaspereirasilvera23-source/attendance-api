import type { Toast } from '../../hooks/useToast'

const ICON: Record<string, string> = {
  success: '?',
  error: '?',
  info: 'i',
}

const BORDER_COLOR: Record<string, string> = {
  success: 'border-l-verde-brillante',
  error: 'border-l-rojo-svc',
  info: 'border-l-gray-500',
}

interface ToastListProps {
  toasts: Toast[]
}

export function ToastList({ toasts }: ToastListProps) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          data-testid={`toast-${toast.type}`}
          className={`flex items-center gap-3 min-w-70 px-5 py-4 rounded-lg bg-gris-card border border-gris-borde border-l-4 ${BORDER_COLOR[toast.type]} shadow-lg text-white text-sm animate-fade-in`}
        >
          <span className="font-bold">{ICON[toast.type]}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
