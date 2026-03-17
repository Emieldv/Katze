import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNfc } from '../hooks/useNfc'
import { useAppBlocker } from '../hooks/useAppBlocker'
import type { useStorage } from '../hooks/useStorage'
import type { NfcCard } from '../types'

type SetupProps = {
  storage: ReturnType<typeof useStorage>
}

type Step = 'code' | 'accessibility' | 'nfc' | 'done'

export default function Setup({ storage }: SetupProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('code')
  const [codeConfirmed, setCodeConfirmed] = useState(false)
  const [pendingCards, setPendingCards] = useState<NfcCard[]>([])
  const [nfcStatus, setNfcStatus] = useState('')
  const { checkAccessibility, openAccessibilitySettings } = useAppBlocker()

  const { scanning, startScan, stopScan } = useNfc({
    onTagDetected: (uid) => {
      if (pendingCards.some((c) => c.uid === uid)) {
        setNfcStatus('This card is already registered. Try a different one.')
        return
      }

      const card: NfcCard = {
        uid,
        name: `Card ${pendingCards.length + 1}`,
        registeredAt: new Date().toISOString(),
      }
      const updated = [...pendingCards, card]
      setPendingCards(updated)
      setNfcStatus(`Card registered! (${updated.length}/2)`)

      if (updated.length >= 2) {
        stopScan()
      }
    },
  })

  async function handleFinishSetup() {
    await storage.saveNfcCards(pendingCards)
    await storage.saveSetupComplete(true)
    setStep('done')
    navigate('/', { replace: true })
  }

  async function handleCheckAccessibility() {
    const enabled = await checkAccessibility()
    if (enabled) {
      setStep('nfc')
    }
  }

  return (
    <div className="min-h-dvh p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-primary-400 mb-2">Katze Setup</h1>
      <p className="text-sm text-gray-400 mb-8">
        Step {step === 'code' ? '1/3' : step === 'accessibility' ? '2/3' : '3/3'}
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
              device settings.
            </p>
            <button
              onClick={openAccessibilitySettings}
              className="w-full py-3 rounded-xl font-semibold text-primary-400 border border-primary-700 active:bg-primary-950 transition-colors"
            >
              Open Accessibility Settings
            </button>
          </div>

          <button
            onClick={handleCheckAccessibility}
            className="mt-auto w-full py-4 rounded-xl font-semibold text-white bg-primary-600 active:bg-primary-700 transition-colors"
          >
            I've enabled it — Continue
          </button>
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

            {pendingCards.length < 2 && (
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
            )}

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
    </div>
  )
}
