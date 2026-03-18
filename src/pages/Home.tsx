import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import SafeArea from '../components/SafeArea'
import { useAppBlocker } from '../hooks/useAppBlocker'
import KatzePlugin from '../plugins/KatzePlugin'

import type { useStorage } from '../hooks/useStorage'

type HomeProps = {
  storage: ReturnType<typeof useStorage>
}

export default function Home({ storage }: HomeProps) {
  const navigate = useNavigate()
  const { setLockState, checkAccessibility, openAccessibilitySettings, accessibilityEnabled } = useAppBlocker()
  const [showOverride, setShowOverride] = useState(false)
  const [overrideInput, setOverrideInput] = useState('')
  const [overrideError, setOverrideError] = useState('')
  const [remainingTime, setRemainingTime] = useState<string | null>(null)
  const notificationRequested = useRef(false)

  // Request notification permission once on first visit
  useEffect(() => {
    if (notificationRequested.current) return
    notificationRequested.current = true
    KatzePlugin.requestNotificationPermission().catch(() => {})
  }, [])

  // Poll accessibility service status
  useEffect(() => {
    checkAccessibility()
    const interval = setInterval(() => {
      checkAccessibility()
    }, 3000)
    return () => clearInterval(interval)
  }, [checkAccessibility])

  // Timer: auto-unlock after configured duration
  useEffect(() => {
    if (!storage.locked || !storage.lockedAt) {
      setRemainingTime(null)
      return
    }

    const timerMs = (storage.timerConfig.hours * 60 + storage.timerConfig.minutes) * 60 * 1000
    const lockedTime = new Date(storage.lockedAt).getTime()

    const interval = setInterval(async () => {
      const elapsed = Date.now() - lockedTime
      const remaining = timerMs - elapsed

      if (remaining <= 0) {
        // Native service handles auto-unlock too, but sync UI state
        await storage.saveLockState(false)
        await setLockState(false, storage.whitelist, undefined)
        setRemainingTime(null)
        clearInterval(interval)
        return
      }

      const hrs = Math.floor(remaining / 3600000)
      const mins = Math.floor((remaining % 3600000) / 60000)
      const secs = Math.floor((remaining % 60000) / 1000)
      setRemainingTime(
        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [storage.locked, storage.lockedAt, storage.timerConfig, storage, setLockState])

  function handleOverride() {
    if (overrideInput === storage.overrideCode) {
      storage.saveLockState(false)
      setLockState(false, storage.whitelist)
      setShowOverride(false)
      setOverrideInput('')
      setOverrideError('')
    } else {
      setOverrideError('Invalid code')
      setOverrideInput('')
    }
  }

  return (
    <SafeArea className='px-6'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-2xl font-bold text-primary-400'>Katze</h1>
        <button
          onClick={() => navigate('/settings')}
          disabled={storage.locked}
          className='text-sm text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed'
        >
          Settings
        </button>
      </div>

      {accessibilityEnabled === false && (
        <div className='bg-red-950 border border-red-800 rounded-xl p-4 mb-6'>
          <p className='text-sm text-red-300 mb-2'>Accessibility service is not enabled. App blocking will not work.</p>
          <button onClick={openAccessibilitySettings} className='text-sm font-semibold text-red-400 underline'>
            Open Accessibility Settings
          </button>
        </div>
      )}

      <div className='flex-1 flex flex-col items-center justify-center'>
        <div
          className={`w-40 h-40 rounded-full flex items-center justify-center mb-6 transition-colors ${
            storage.locked ? 'bg-primary-600 shadow-lg shadow-primary-900/50' : 'bg-surface-light'
          }`}
        >
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={1.5}
            className={`w-16 h-16 ${storage.locked ? 'text-white' : 'text-gray-500'}`}
          >
            {storage.locked ? (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z'
              />
            ) : (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z'
              />
            )}
          </svg>
        </div>

        <p className='text-xl font-semibold mb-2'>{storage.locked ? 'Apps Locked' : 'Apps Unlocked'}</p>

        {storage.locked && remainingTime && (
          <p className='text-sm text-gray-400 font-mono mb-2'>Auto-unlock in {remainingTime}</p>
        )}

        <p className='text-sm text-gray-500 mb-8'>
          {storage.locked ? 'Tap your NFC card to unlock' : 'Tap your NFC card to lock apps'}
        </p>

        {storage.locked && (
          <button onClick={() => setShowOverride(!showOverride)} className='text-xs text-gray-600 underline'>
            Emergency override
          </button>
        )}
      </div>

      {showOverride && (
        <div className='bg-surface-light rounded-2xl p-6 mb-6'>
          <h3 className='text-sm font-semibold mb-3 text-gray-300'>Enter Override Code</h3>
          <input
            type='text'
            value={overrideInput}
            onChange={(e) => {
              setOverrideInput(e.target.value)
              setOverrideError('')
            }}
            placeholder='Enter your emergency code'
            className='w-full bg-surface rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-primary-700 mb-3'
          />
          {overrideError && <p className='text-xs text-red-400 mb-3'>{overrideError}</p>}
          <button
            onClick={handleOverride}
            disabled={!overrideInput}
            className='w-full py-3 rounded-xl font-semibold text-sm text-white bg-red-700 disabled:opacity-30 active:bg-red-800 transition-colors'
          >
            Unlock with Override
          </button>
        </div>
      )}
    </SafeArea>
  )
}
