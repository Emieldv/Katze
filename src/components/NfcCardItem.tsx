import { useState } from 'react'

import LinkButton from './LinkButton'

type NfcCardItemProps = {
  uid: string
  name: string
  onRename: (uid: string, name: string) => void
  onRemove: (uid: string) => void
}

export default function NfcCardItem({ uid, name, onRename, onRemove }: NfcCardItemProps) {
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(name)

  function saveRename() {
    if (!nameInput.trim()) return
    onRename(uid, nameInput.trim())
    setEditing(false)
  }

  return (
    <div className='bg-surface-light rounded-xl p-4'>
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0'>
          N
        </div>

        <div className='flex-1 min-w-0'>
          {editing ? (
            <div className='flex gap-2'>
              <input
                type='text'
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                className='flex-1 bg-surface rounded-lg px-3 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-primary-700'
                // biome-ignore lint/a11y/noAutofocus: mobile app, autofocus improves UX for inline rename
                autoFocus
              />
              <LinkButton onClick={saveRename} text='Save' />
            </div>
          ) : (
            <>
              <p className='text-sm font-medium truncate'>{name}</p>
              <p className='text-xs text-gray-600 font-mono'>{uid}</p>
            </>
          )}
        </div>

        {!editing && (
          <div className='flex gap-2'>
            <LinkButton
              variant='muted'
              text='Rename'
              onClick={() => {
                setNameInput(name)
                setEditing(true)
              }}
            />
            <LinkButton variant='danger' text='Remove' onClick={() => onRemove(uid)} />
          </div>
        )}
      </div>
    </div>
  )
}
