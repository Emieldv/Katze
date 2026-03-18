type NumberStepperProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}

export default function NumberStepper({ label, value, min, max, step = 1, onChange }: NumberStepperProps) {
  function update(delta: number) {
    const next = value + delta
    onChange(Math.max(min, Math.min(max, next)))
  }

  return (
    <div className='text-center'>
      {/* biome-ignore lint/a11y/noLabelWithoutControl: custom +/- stepper, not a standard input */}
      <label className='text-xs text-gray-500 block mb-2'>{label}</label>
      <div className='flex items-center gap-2'>
        <button
          onClick={() => update(-step)}
          className='w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg text-gray-400 active:bg-surface-lighter'
        >
          -
        </button>
        <span className='text-3xl font-mono font-bold text-white w-12 text-center'>
          {value.toString().padStart(2, '0')}
        </span>
        <button
          onClick={() => update(step)}
          className='w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg text-gray-400 active:bg-surface-lighter'
        >
          +
        </button>
      </div>
    </div>
  )
}
