import type { InputHTMLAttributes } from 'react'

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Background style. Use `surface` for inputs rendered on the main surface background. */
  variant?: 'default' | 'surface'
}

const variants = {
  default: 'bg-surface-light',
  surface: 'bg-surface',
}

/** Single-line text input with rounded styling. */
export default function TextInput({ variant = 'default', className = '', ...props }: TextInputProps) {
  return (
    <input
      type='text'
      className={`w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-primary-700 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
