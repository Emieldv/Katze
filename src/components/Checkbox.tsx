type CheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

/** Accessible checkbox with an optional label. */
export default function Checkbox({ checked, onChange, label, className = '' }: CheckboxProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-3 cursor-pointer text-left ${className}`}
    >
      <div
        className={`w-5 h-5 mt-0.5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
          checked ? 'bg-primary-600 border-primary-600' : 'border-gray-600'
        }`}
      >
        {checked && (
          <svg viewBox='0 0 12 12' className='w-3 h-3 text-white'>
            <path fill='currentColor' d='M10 3L4.5 8.5 2 6l.7-.7L4.5 7.1 9.3 2.3z' />
          </svg>
        )}
      </div>
      {label && <span className='text-sm text-gray-300'>{label}</span>}
    </button>
  )
}
