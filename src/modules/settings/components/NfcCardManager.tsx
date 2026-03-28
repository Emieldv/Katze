import { useState } from 'react'

import Button from '../../../components/Button'
import LinkButton from '../../../components/LinkButton'
import Spinner from '../../../components/Spinner'
import TextInput from '../../../components/TextInput'
import { useNfc } from '../../../hooks/useNfc'
import NfcCardItem from './NfcCardItem'

import type { NfcCard } from '../../../types'

type NfcCardManagerProps = {
  cards: NfcCard[]
  onSave: (cards: NfcCard[]) => Promise<void>
}

export default function NfcCardManager({ cards, onSave }: NfcCardManagerProps) {
  const [addStatus, setAddStatus] = useState('')
  const [pendingUid, setPendingUid] = useState<string | null>(null)
  const [newCardName, setNewCardName] = useState('')

  const { scanning, startScan, stopScan } = useNfc({
    onTagDetected: (uid) => {
      if (cards.some((c) => c.uid === uid)) {
        setAddStatus('This card is already registered.')
        return
      }

      stopScan()
      setPendingUid(uid)
      setNewCardName('')
      setAddStatus('')
    },
  })

  function confirmNewCard() {
    if (!pendingUid || !newCardName.trim()) return

    const card: NfcCard = {
      uid: pendingUid,
      name: newCardName.trim(),
      registeredAt: new Date().toISOString(),
    }
    onSave([...cards, card])
    setPendingUid(null)
    setNewCardName('')
    setAddStatus('Card added!')
  }

  function cancelNewCard() {
    setPendingUid(null)
    setNewCardName('')
  }

  function handleRename(uid: string, name: string) {
    onSave(cards.map((c) => (c.uid === uid ? { ...c, name } : c)))
  }

  function handleRemove(uid: string) {
    if (cards.length <= 2) {
      setAddStatus('You must keep at least 2 NFC cards registered.')
      return
    }
    onSave(cards.filter((c) => c.uid !== uid))
  }

  return (
    <div>
      <p className='text-xs text-gray-400 mb-3'>Minimum 2 cards required. Tap any registered card to lock/unlock.</p>

      <div className='space-y-2 mb-4'>
        {cards.map((card) => (
          <NfcCardItem key={card.uid} uid={card.uid} name={card.name} onRename={handleRename} onRemove={handleRemove} />
        ))}
      </div>

      {pendingUid ? (
        <div className='bg-surface-light rounded-xl p-4'>
          <p className='text-sm text-gray-400 mb-2'>Card detected! Give it a name:</p>
          <TextInput
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmNewCard()}
            placeholder='e.g. Desk card, Keychain tag'
            variant='surface'
            className='mb-3'
            autoFocus
          />
          <div className='flex gap-2'>
            <Button onClick={confirmNewCard} disabled={!newCardName.trim()} fullWidth>
              Save Card
            </Button>
            <Button variant='ghost' onClick={cancelNewCard}>
              Cancel
            </Button>
          </div>
        </div>
      ) : !scanning ? (
        <Button
          variant='outline'
          fullWidth
          onClick={() => {
            setAddStatus('')
            startScan()
          }}
        >
          Add Another Card
        </Button>
      ) : (
        <div className='text-center py-4'>
          <Spinner className='mx-auto mb-2' />
          <p className='text-sm text-gray-400 mb-2'>Hold NFC card near phone...</p>
          <LinkButton variant='muted' underline text='Cancel' onClick={stopScan} />
        </div>
      )}

      {addStatus && <p className='text-sm text-primary-400 mt-3 text-center'>{addStatus}</p>}
    </div>
  )
}
