import type { InputHTMLAttributes } from 'react'

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'default' | 'surface'
}

const variants = {
  default: 'bg-surface-light',
  surface: 'bg-surface',
}

export default function TextInput({ variant = 'default', className = '', ...props }: TextInputProps) {
  return (
    <input
      type='text'
      className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-primary-700 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
