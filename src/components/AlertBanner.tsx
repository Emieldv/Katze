type AlertBannerProps = {
  variant?: 'error' | 'warning' | 'info'
  content: string
  action?: {
    label: string
    onClick: () => void
  }
}

const variants = {
  error: {
    container: 'bg-red-950 border-red-800',
    text: 'text-red-300',
    action: 'text-red-400',
  },
  warning: {
    container: 'bg-yellow-950 border-yellow-800',
    text: 'text-yellow-300',
    action: 'text-yellow-400',
  },
  info: {
    container: 'bg-primary-950 border-primary-800',
    text: 'text-primary-300',
    action: 'text-primary-400',
  },
}

export default function AlertBanner({ variant = 'error', content, action }: AlertBannerProps) {
  const styles = variants[variant]

  return (
    <div className={`${styles.container} border rounded-xl p-4`}>
      <p className={`text-sm ${styles.text} ${action ? 'mb-2' : ''}`}>{content}</p>
      {action && (
        <button onClick={action.onClick} className={`text-sm font-semibold ${styles.action} underline`}>
          {action.label}
        </button>
      )}
    </div>
  )
}
