import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Visual style of the button. */
  variant?: ButtonVariant
  /** Stretches the button to fill its container width. */
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'font-semibold text-white bg-primary-600 disabled:opacity-30 disabled:cursor-not-allowed active:bg-primary-700',
  outline: 'font-semibold text-primary-400 border border-primary-700 active:bg-primary-950',
  danger: 'font-semibold text-white bg-red-700 disabled:opacity-30 active:bg-red-800',
  ghost: 'text-gray-400 active:bg-surface-lighter',
}

/** Primary action button with multiple visual variants. */
export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`py-3 rounded-xl text-sm transition-colors ${variants[variant]} ${fullWidth ? 'w-full' : 'px-4'} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
