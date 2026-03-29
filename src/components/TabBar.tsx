type Tab<T extends string> = {
  key: T
  label: string
}

type TabBarProps<T extends string> = {
  tabs: Tab<T>[]
  activeTab: T
  onTabChange: (tab: T) => void
}

/** Generic tab navigation bar with typed tab keys. */
export default function TabBar<T extends string>({ tabs, activeTab, onTabChange }: TabBarProps<T>) {
  return (
    <div className='flex gap-1 bg-surface-light rounded-xl p-1'>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab.key ? 'bg-primary-700 text-white' : 'text-gray-400'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
