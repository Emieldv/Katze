type AppListItemProps = {
  appName: string
  packageName: string
  icon?: string
  selected: boolean
  onToggle: () => void
}

export default function AppListItem({ appName, packageName, icon, selected, onToggle }: AppListItemProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: custom styled row with ARIA checkbox semantics
    <div
      role='checkbox'
      aria-checked={selected}
      aria-label={appName}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onToggle()}
      className='w-full flex items-center gap-3 p-3 rounded-xl transition-colors active:bg-surface-lighter cursor-pointer'
    >
      {icon ? (
        <img
          src={icon.startsWith('http') ? icon : `data:image/png;base64,${icon}`}
          alt=''
          className='w-10 h-10 rounded-lg'
        />
      ) : (
        <div className='w-10 h-10 rounded-lg bg-surface-lighter flex items-center justify-center text-xs text-gray-400'>
          ?
        </div>
      )}

      <div className='flex-1 text-left'>
        <p className='text-sm font-medium'>{appName}</p>
        <p className='text-xs text-gray-400'>{packageName}</p>
      </div>

      <div
        aria-hidden='true'
        className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
          selected ? 'bg-primary-600 border-primary-600' : 'border-gray-600'
        }`}
      >
        {selected && (
          <svg viewBox='0 0 12 12' className='w-3 h-3 text-white'>
            <path fill='currentColor' d='M10 3L4.5 8.5 2 6l.7-.7L4.5 7.1 9.3 2.3z' />
          </svg>
        )}
      </div>
    </div>
  )
}
