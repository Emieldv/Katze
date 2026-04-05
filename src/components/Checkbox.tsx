import { Check } from '@phosphor-icons/react'

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
        {checked && <Check className='w-3 h-3 text-white' weight='bold' />}
      </div>
      {label && <span className='text-sm text-gray-300'>{label}</span>}
    </button>
  )
}
