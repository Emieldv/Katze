import { Check } from '@phosphor-icons/react'

type AppListItemProps = {
  appName: string
  packageName: string
  /** Base64-encoded PNG or HTTP URL for the app icon. */
  icon?: string
  selected: boolean
  onToggle: () => void
}

/** Selectable row representing an installed app, used in the whitelist picker. */
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
        {selected && <Check className='w-3 h-3 text-white' weight='bold' />}
      </div>
    </div>
  )
}
