import { useState } from 'react'
import { useNfc } from '../hooks/useNfc'
import type { NfcCard } from '../types'

type NfcCardManagerProps = {
  cards: NfcCard[]
  onSave: (cards: NfcCard[]) => Promise<void>
}

export default function NfcCardManager({ cards, onSave }: NfcCardManagerProps) {
  const [editingName, setEditingName] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [addStatus, setAddStatus] = useState('')

  const { scanning, startScan, stopScan } = useNfc({
    onTagDetected: (uid) => {
      if (cards.some((c) => c.uid === uid)) {
        setAddStatus('This card is already registered.')
        return
      }

      const card: NfcCard = {
        uid,
        name: `Card ${cards.length + 1}`,
        registeredAt: new Date().toISOString(),
      }
      onSave([...cards, card])
      setAddStatus('Card added!')
      stopScan()
    },
  })

  function removeCard(uid: string) {
    if (cards.length <= 2) {
      setAddStatus('You must keep at least 2 NFC cards registered.')
      return
    }
    onSave(cards.filter((c) => c.uid !== uid))
  }

  function startRename(card: NfcCard) {
    setEditingName(card.uid)
    setNameInput(card.name)
  }

  function saveRename(uid: string) {
    if (!nameInput.trim()) return
    onSave(
      cards.map((c) => (c.uid === uid ? { ...c, name: nameInput.trim() } : c)),
    )
    setEditingName(null)
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Minimum 2 cards required. Tap any registered card to lock/unlock.
      </p>

      <div className="space-y-2 mb-4">
        {cards.map((card) => (
          <div
            key={card.uid}
            className="bg-surface-light rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0">
                N
              </div>

              <div className="flex-1 min-w-0">
                {editingName === card.uid ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveRename(card.uid)}
                      className="flex-1 bg-surface rounded-lg px-3 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-primary-700"
                      autoFocus
                    />
                    <button
                      onClick={() => saveRename(card.uid)}
                      className="text-xs text-primary-400"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium truncate">{card.name}</p>
                    <p className="text-xs text-gray-600 font-mono">{card.uid}</p>
                  </>
                )}
              </div>

              {editingName !== card.uid && (
                <div className="flex gap-2">
                  <button
                    onClick={() => startRename(card)}
                    className="text-xs text-gray-500"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => removeCard(card.uid)}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!scanning ? (
        <button
          onClick={() => {
            setAddStatus('')
            startScan()
          }}
          className="w-full py-3 rounded-xl font-semibold text-sm text-primary-400 border border-primary-700 active:bg-primary-950 transition-colors"
        >
          Add Another Card
        </button>
      ) : (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-400 mb-2">Hold NFC card near phone...</p>
          <button onClick={stopScan} className="text-xs text-gray-600 underline">
            Cancel
          </button>
        </div>
      )}

      {addStatus && (
        <p className="text-sm text-primary-400 mt-3 text-center">{addStatus}</p>
      )}
    </div>
  )
}
