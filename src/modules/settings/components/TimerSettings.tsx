import NumberStepper from '../../../components/NumberStepper'

import type { TimerConfig } from '../../../types'

type TimerSettingsProps = {
  config: TimerConfig
  onSave: (config: TimerConfig) => Promise<void>
}

export default function TimerSettings({ config, onSave }: TimerSettingsProps) {
  const totalMinutes = config.hours * 60 + config.minutes

  return (
    <div>
      <p className='text-xs text-gray-400 mb-4'>After this duration, all apps will be automatically unlocked.</p>

      <div className='bg-surface-light rounded-2xl p-6'>
        <div className='flex items-center justify-center gap-4 mb-6'>
          <NumberStepper
            label='Hours'
            value={config.hours}
            min={0}
            max={24}
            onChange={(hours) => onSave({ ...config, hours })}
          />

          <span className='text-3xl font-bold text-gray-400 mt-6'>:</span>

          <NumberStepper
            label='Minutes'
            value={config.minutes}
            min={0}
            max={59}
            step={5}
            onChange={(minutes) => onSave({ ...config, minutes })}
          />
        </div>

        {totalMinutes === 0 && (
          <p className='text-xs text-red-400 text-center'>Timer cannot be zero — apps would unlock immediately.</p>
        )}

        {totalMinutes > 0 && (
          <p className='text-xs text-gray-400 text-center'>
            Apps will auto-unlock after {config.hours > 0 ? `${config.hours}h ` : ''}
            {config.minutes > 0 ? `${config.minutes}m` : ''}
          </p>
        )}
      </div>
    </div>
  )
}
