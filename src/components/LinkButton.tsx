import type { ButtonHTMLAttributes, ReactNode } from 'react'

type LinkButtonVariant = 'primary' | 'muted' | 'danger'
type LinkButtonSize = 'small' | 'medium'

type LinkButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: LinkButtonVariant
  size?: LinkButtonSize
  text: string
  icon?: ReactNode
  underline?: boolean
}

const variants: Record<LinkButtonVariant, string> = {
  primary: 'text-primary-400',
  muted: 'text-gray-400',
  danger: 'text-red-500',
}

const sizes: Record<LinkButtonSize, string> = {
  small: 'text-xs',
  medium: 'text-sm',
}

export default function LinkButton({
  variant = 'primary',
  size = 'small',
  text,
  icon,
  underline = false,
  className = '',
  ...props
}: LinkButtonProps) {
  return (
    <button
      className={`${sizes[size]} ${variants[variant]} ${underline ? 'underline' : ''} disabled:opacity-30 disabled:cursor-not-allowed ${icon ? 'flex items-center gap-2' : ''} ${className}`}
      {...props}
    >
      {icon}
      {text}
    </button>
  )
}
