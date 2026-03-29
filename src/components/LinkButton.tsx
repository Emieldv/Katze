import type { ButtonHTMLAttributes, ReactNode } from 'react'

type LinkButtonVariant = 'primary' | 'muted' | 'danger'
type LinkButtonSize = 'small' | 'medium'

type LinkButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Color variant. */
  variant?: LinkButtonVariant
  /** Text size. */
  size?: LinkButtonSize
  /** Button label. */
  text: string
  /** Optional icon rendered before the text. */
  icon?: ReactNode
  /** Renders the text with an underline. */
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

/** Text-style button for secondary or inline actions. */
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
