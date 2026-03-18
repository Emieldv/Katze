import type { ReactNode } from 'react'

type SafeAreaProps = {
  children: ReactNode
  className?: string
}

export default function SafeArea({ children, className = '' }: SafeAreaProps) {
  return (
    <div
      className={`flex flex-col h-dvh ${className}`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {children}
    </div>
  )
}
