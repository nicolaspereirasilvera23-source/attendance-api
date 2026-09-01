import { useRef, useEffect } from 'react'

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
}

export function CodeInput({ value, onChange, onSubmit, disabled }: CodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Mantener el foco en el input para uso tipo kiosco
  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    onChange(raw)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') onSubmit()
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      data-testid="codigo-input"
      placeholder="Ingresa tu codigo de 4 digitos"
      inputMode="numeric"
      maxLength={4}
      autoComplete="off"
      className="w-full px-4 py-4 bg-gris-input border-2 border-gris-borde rounded-xl text-white text-center text-lg tracking-widest outline-none transition-colors focus:border-verde-svc disabled:opacity-60"
    />
  )
}
