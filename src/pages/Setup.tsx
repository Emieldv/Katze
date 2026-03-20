import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '../components/Button'
import Checkbox from '../components/Checkbox'
import SafeArea from '../components/SafeArea'
import Spinner from '../components/Spinner'
import TextInput from '../components/TextInput'
import { useAppBlocker } from '../hooks/useAppBlocker'
import { useNfc } from '../hooks/useNfc'
import KatzePlugin from '../plugins/KatzePlugin'

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
    <SafeArea className='px-6'>
      <h1 className='text-2xl font-bold text-primary-400 mb-2'>Katze Setup</h1>
      <p className='text-sm text-gray-400 mb-8'>
        Step {step === 'code' ? '1/4' : step === 'accessibility' ? '2/4' : step === 'dnd' ? '3/4' : '4/4'}
      </p>

      {step === 'code' && (
        <div className='flex-1 flex flex-col'>
          <div className='bg-surface-light rounded-2xl p-6 mb-6'>
            <h2 className='text-lg font-semibold mb-2'>Emergency Override Code</h2>
            <p className='text-sm text-gray-400 mb-4'>
              Write this code down and store it somewhere safe. You'll need it if you lose access to your NFC cards.
            </p>
            <div className='bg-surface rounded-xl p-4 font-mono text-xl text-primary-400 text-center tracking-widest break-all select-all'>
              {storage.overrideCode}
            </div>
          </div>

          <Checkbox
            checked={codeConfirmed}
            onChange={setCodeConfirmed}
            label='I have written down the override code and stored it in a safe place'
            className='mb-6'
          />

          <Button onClick={() => setStep('accessibility')} disabled={!codeConfirmed} fullWidth className='mt-auto py-4'>
            Continue
          </Button>
        </div>
      )}

      {step === 'accessibility' && (
        <div className='flex-1 flex flex-col'>
          <div className='bg-surface-light rounded-2xl p-6 mb-6'>
            <h2 className='text-lg font-semibold mb-2'>Accessibility Service</h2>
            <p className='text-sm text-gray-400 mb-4'>
              Katze needs the Accessibility Service to block apps. Enable it in your device settings — this page will
              advance automatically once detected.
            </p>
            <Button variant='outline' fullWidth onClick={openAccessibilitySettings}>
              Open Accessibility Settings
            </Button>
          </div>

          <div className='mt-auto flex items-center justify-center gap-3 py-4'>
            <Spinner size='sm' />
            <p className='text-sm text-gray-400'>Waiting for accessibility service...</p>
          </div>
        </div>
      )}

      {step === 'dnd' && (
        <div className='flex-1 flex flex-col'>
          <div className='bg-surface-light rounded-2xl p-6 mb-6'>
            <h2 className='text-lg font-semibold mb-2'>Do Not Disturb</h2>
            <p className='text-sm text-gray-400 mb-4'>
              Katze uses Do Not Disturb to silence app notifications while locked. Calls and texts will still come
              through. Grant access in your device settings — this page will advance automatically once detected.
            </p>
            <Button variant='outline' fullWidth onClick={() => KatzePlugin.openDndSettings()}>
              Open DND Settings
            </Button>
          </div>

          <div className='mt-auto flex items-center justify-center gap-3 py-4'>
            <Spinner size='sm' />
            <p className='text-sm text-gray-400'>Waiting for DND access...</p>
          </div>
        </div>
      )}

      {step === 'nfc' && (
        <div className='flex-1 flex flex-col'>
          <div className='bg-surface-light rounded-2xl p-6 mb-6'>
            <h2 className='text-lg font-semibold mb-2'>Register NFC Cards</h2>
            <p className='text-sm text-gray-400 mb-4'>
              Register at least 2 NFC cards. These will be used to lock and unlock your apps.
            </p>

            {pendingCards.map((card, i) => (
              <div key={card.uid} className='flex items-center gap-3 bg-surface rounded-xl p-3 mb-2'>
                <div className='w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center text-primary-400 font-bold text-sm'>
                  {i + 1}
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>{card.name}</p>
                  <p className='text-xs text-gray-500 font-mono'>{card.uid}</p>
                </div>
              </div>
            ))}

            {pendingUid ? (
              <div className='bg-surface rounded-xl p-4 mt-2'>
                <p className='text-sm text-gray-400 mb-2'>Card detected! Give it a name:</p>
                <TextInput
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmCardName()}
                  placeholder='e.g. Desk card, Keychain tag'
                  variant='surface'
                  className='mb-3'
                  autoFocus
                />
                <Button onClick={confirmCardName} disabled={!cardName.trim()} fullWidth>
                  Save Card
                </Button>
              </div>
            ) : pendingCards.length < 2 ? (
              !scanning ? (
                <Button variant='outline' fullWidth onClick={startScan} className='mt-2'>
                  {pendingCards.length === 0 ? 'Scan First Card' : 'Scan Second Card'}
                </Button>
              ) : (
                <div className='text-center py-4'>
                  <Spinner size='lg' className='mx-auto mb-2' />
                  <p className='text-sm text-gray-400'>Hold your NFC card near the phone...</p>
                </div>
              )
            ) : null}

            {nfcStatus && <p className='text-sm text-primary-400 mt-2 text-center'>{nfcStatus}</p>}
          </div>

          <Button onClick={handleFinishSetup} disabled={pendingCards.length < 2} fullWidth className='mt-auto py-4'>
            Finish Setup
          </Button>
        </div>
      )}
    </SafeArea>
  )
}
