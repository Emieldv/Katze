import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNfc } from '../hooks/useNfc'
import { useAppBlocker } from '../hooks/useAppBlocker'
import KatzePlugin from '../plugins/KatzePlugin'
import SafeArea from '../components/SafeArea'
import type { useStorage } from '../hooks/useStorage'
import type { NfcCard } from '../types'

type SetupProps = {
  storage: ReturnType<typeof useStorage>
}

type Step = 'code' | 'accessibility' | 'dnd' | 'nfc' | 'done'

export default function Setup({ storage }: SetupProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('code')
  const [codeConfirmed, setCodeConfirmed] = useState(false)
  const [pendingCards, setPendingCards] = useState<NfcCard[]>([])
  const [nfcStatus, setNfcStatus] = useState('')
  const [pendingUid, setPendingUid] = useState<string | null>(null)
  const [cardName, setCardName] = useState('')
  const { checkAccessibility, openAccessibilitySettings } = useAppBlocker()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll accessibility status when on that step
  useEffect(() => {
    if (step !== 'accessibility') {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }

    pollRef.current = setInterval(async () => {
      const enabled = await checkAccessibility()
      if (enabled) {
        setStep('dnd')
      }
    }, 1500)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [step, checkAccessibility])

  // Poll DND policy access when on that step
  useEffect(() => {
    if (step !== 'dnd') return

    const poll = setInterval(async () => {
      const { granted } = await KatzePlugin.isDndPolicyGranted()
      if (granted) {
        setStep('nfc')
      }
    }, 1500)

    return () => clearInterval(poll)
  }, [step])

  const { scanning, startScan, stopScan } = useNfc({
    onTagDetected: (uid) => {
      if (pendingCards.some((c) => c.uid === uid)) {
        setNfcStatus('This card is already registered. Try a different one.')
        return
      }

      stopScan()
      setPendingUid(uid)
      setCardName('')
      setNfcStatus('')
    },
  })

  function confirmCardName() {
    if (!pendingUid || !cardName.trim()) return

    const card: NfcCard = {
      uid: pendingUid,
      name: cardName.trim(),
      registeredAt: new Date().toISOString(),
    }
    const updated = [...pendingCards, card]
    setPendingCards(updated)
    setPendingUid(null)
    setCardName('')
    setNfcStatus(`Card registered! (${updated.length}/2)`)
  }

  async function handleFinishSetup() {
    await storage.saveNfcCards(pendingCards)
    await storage.saveSetupComplete(true)
    setStep('done')
    navigate('/', { replace: true })
  }

  return (
    <SafeArea className="px-6">
      <h1 className="text-2xl font-bold text-primary-400 mb-2">Katze Setup</h1>
      <p className="text-sm text-gray-400 mb-8">
        Step {step === 'code' ? '1/4' : step === 'accessibility' ? '2/4' : step === 'dnd' ? '3/4' : '4/4'}
      </p>

      {step === 'code' && (
        <div className="flex-1 flex flex-col">
          <div className="bg-surface-light rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Emergency Override Code</h2>
            <p className="text-sm text-gray-400 mb-4">
              Write this code down and store it somewhere safe. You'll need it if you lose
              access to your NFC cards.
            </p>
            <div className="bg-surface rounded-xl p-4 font-mono text-xl text-primary-400 text-center tracking-widest break-all select-all">
              {storage.overrideCode}
            </div>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={codeConfirmed}
              onChange={(e) => setCodeConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 accent-primary-500"
            />
            <span className="text-sm text-gray-300">
              I have written down the override code and stored it in a safe place
            </span>
          </label>

          <button
            onClick={() => setStep('accessibility')}
            disabled={!codeConfirmed}
            className="mt-auto w-full py-4 rounded-xl font-semibold text-white bg-primary-600 disabled:opacity-30 disabled:cursor-not-allowed active:bg-primary-700 transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'accessibility' && (
        <div className="flex-1 flex flex-col">
          <div className="bg-surface-light rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Accessibility Service</h2>
            <p className="text-sm text-gray-400 mb-4">
              Katze needs the Accessibility Service to block apps. Enable it in your
              device settings — this page will advance automatically once detected.
            </p>
            <button
              onClick={openAccessibilitySettings}
              className="w-full py-3 rounded-xl font-semibold text-primary-400 border border-primary-700 active:bg-primary-950 transition-colors"
            >
              Open Accessibility Settings
            </button>
          </div>

          <div className="mt-auto flex items-center justify-center gap-3 py-4">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Waiting for accessibility service...</p>
          </div>
        </div>
      )}

      {step === 'dnd' && (
        <div className="flex-1 flex flex-col">
          <div className="bg-surface-light rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Do Not Disturb</h2>
            <p className="text-sm text-gray-400 mb-4">
              Katze uses Do Not Disturb to silence app notifications while locked.
              Calls and texts will still come through. Grant access in your device
              settings — this page will advance automatically once detected.
            </p>
            <button
              onClick={() => KatzePlugin.openDndSettings()}
              className="w-full py-3 rounded-xl font-semibold text-primary-400 border border-primary-700 active:bg-primary-950 transition-colors"
            >
              Open DND Settings
            </button>
          </div>

          <div className="mt-auto flex items-center justify-center gap-3 py-4">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Waiting for DND access...</p>
          </div>
        </div>
      )}

      {step === 'nfc' && (
        <div className="flex-1 flex flex-col">
          <div className="bg-surface-light rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Register NFC Cards</h2>
            <p className="text-sm text-gray-400 mb-4">
              Register at least 2 NFC cards. These will be used to lock and unlock your apps.
            </p>

            {pendingCards.map((card, i) => (
              <div
                key={card.uid}
                className="flex items-center gap-3 bg-surface rounded-xl p-3 mb-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{card.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{card.uid}</p>
                </div>
              </div>
            ))}

            {pendingUid ? (
              <div className="bg-surface rounded-xl p-4 mt-2">
                <p className="text-sm text-gray-400 mb-2">Card detected! Give it a name:</p>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmCardName()}
                  placeholder="e.g. Desk card, Keychain tag"
                  className="w-full bg-surface-light rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-primary-700 mb-3"
                  autoFocus
                />
                <button
                  onClick={confirmCardName}
                  disabled={!cardName.trim()}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-primary-600 disabled:opacity-30 disabled:cursor-not-allowed active:bg-primary-700 transition-colors"
                >
                  Save Card
                </button>
              </div>
            ) : pendingCards.length < 2 ? (
              <>
                {!scanning ? (
                  <button
                    onClick={startScan}
                    className="w-full py-3 rounded-xl font-semibold text-primary-400 border border-primary-700 active:bg-primary-950 transition-colors mt-2"
                  >
                    {pendingCards.length === 0 ? 'Scan First Card' : 'Scan Second Card'}
                  </button>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Hold your NFC card near the phone...</p>
                  </div>
                )}
              </>
            ) : null}

            {nfcStatus && (
              <p className="text-sm text-primary-400 mt-2 text-center">{nfcStatus}</p>
            )}
          </div>

          <button
            onClick={handleFinishSetup}
            disabled={pendingCards.length < 2}
            className="mt-auto w-full py-4 rounded-xl font-semibold text-white bg-primary-600 disabled:opacity-30 disabled:cursor-not-allowed active:bg-primary-700 transition-colors"
          >
            Finish Setup
          </button>
        </div>
      )}
    </SafeArea>
  )
}
