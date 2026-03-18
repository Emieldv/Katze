import type { TimerConfig } from '../types'

type TimerSettingsProps = {
  config: TimerConfig
  onSave: (config: TimerConfig) => Promise<void>
}

export default function TimerSettings({ config, onSave }: TimerSettingsProps) {
  function updateHours(hours: number) {
    const clamped = Math.max(0, Math.min(24, hours))
    onSave({ ...config, hours: clamped })
  }

  function updateMinutes(minutes: number) {
    const clamped = Math.max(0, Math.min(59, minutes))
    onSave({ ...config, minutes: clamped })
  }

  const totalMinutes = config.hours * 60 + config.minutes

  return (
    <div>
      <p className='text-xs text-gray-500 mb-4'>After this duration, all apps will be automatically unlocked.</p>

      <div className='bg-surface-light rounded-2xl p-6'>
        <div className='flex items-center justify-center gap-4 mb-6'>
          <div className='text-center'>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom +/- stepper, not a standard input */}
            <label className='text-xs text-gray-500 block mb-2'>Hours</label>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => updateHours(config.hours - 1)}
                className='w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg text-gray-400 active:bg-surface-lighter'
              >
                -
              </button>
              <span className='text-3xl font-mono font-bold text-white w-12 text-center'>
                {config.hours.toString().padStart(2, '0')}
              </span>
              <button
                onClick={() => updateHours(config.hours + 1)}
                className='w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg text-gray-400 active:bg-surface-lighter'
              >
                +
              </button>
            </div>
          </div>

          <span className='text-3xl font-bold text-gray-600 mt-6'>:</span>

          <div className='text-center'>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom +/- stepper, not a standard input */}
            <label className='text-xs text-gray-500 block mb-2'>Minutes</label>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => updateMinutes(config.minutes - 5)}
                className='w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg text-gray-400 active:bg-surface-lighter'
              >
                -
              </button>
              <span className='text-3xl font-mono font-bold text-white w-12 text-center'>
                {config.minutes.toString().padStart(2, '0')}
              </span>
              <button
                onClick={() => updateMinutes(config.minutes + 5)}
                className='w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg text-gray-400 active:bg-surface-lighter'
              >
                +
              </button>
            </div>
          </div>
        </div>

        {totalMinutes === 0 && (
          <p className='text-xs text-red-400 text-center'>Timer cannot be zero — apps would unlock immediately.</p>
        )}

        {totalMinutes > 0 && (
          <p className='text-xs text-gray-500 text-center'>
            Apps will auto-unlock after {config.hours > 0 ? `${config.hours}h ` : ''}
            {config.minutes > 0 ? `${config.minutes}m` : ''}
          </p>
        )}
      </div>
    </div>
  )
}
