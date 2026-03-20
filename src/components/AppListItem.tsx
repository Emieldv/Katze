import Checkbox from './Checkbox'

type AppListItemProps = {
  appName: string
  packageName: string
  icon?: string
  selected: boolean
  onToggle: () => void
}

export default function AppListItem({ appName, packageName, icon, selected, onToggle }: AppListItemProps) {
  return (
    <button
      onClick={onToggle}
      className='w-full flex items-center gap-3 p-3 rounded-xl transition-colors active:bg-surface-lighter'
    >
      {icon ? (
        <img
          src={icon.startsWith('http') ? icon : `data:image/png;base64,${icon}`}
          alt=''
          className='w-10 h-10 rounded-lg'
        />
      ) : (
        <div className='w-10 h-10 rounded-lg bg-surface-lighter flex items-center justify-center text-xs text-gray-500'>
          ?
        </div>
      )}

      <div className='flex-1 text-left'>
        <p className='text-sm font-medium'>{appName}</p>
        <p className='text-xs text-gray-600'>{packageName}</p>
      </div>

      <Checkbox checked={selected} onChange={onToggle} />
    </button>
  )
}
