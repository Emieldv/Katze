import { Preferences } from '@capacitor/preferences'
import { useCallback, useEffect, useState } from 'react'

import { generateOverrideCode } from '../utils/codeGenerator'

import type { NfcCard, TimerConfig } from '../types'

const KEYS = {
  SETUP_COMPLETE: 'katze_setup_complete',
  OVERRIDE_CODE: 'katze_override_code',
  NFC_CARDS: 'katze_nfc_cards',
  WHITELIST: 'katze_whitelist',
  TIMER_CONFIG: 'katze_timer_config',
  LOCKED: 'katze_locked',
  LOCKED_AT: 'katze_locked_at',
} as const

async function get<T>(key: string, fallback: T): Promise<T> {
  const { value } = await Preferences.get({ key })
  if (value === null) return fallback
  return JSON.parse(value) as T
}

async function set(key: string, value: unknown): Promise<void> {
  await Preferences.set({ key, value: JSON.stringify(value) })
}

export function useStorage() {
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null)
  const [overrideCode, setOverrideCode] = useState('')
  const [nfcCards, setNfcCards] = useState<NfcCard[]>([])
  const [whitelist, setWhitelist] = useState<string[]>([])
  const [timerConfig, setTimerConfig] = useState<TimerConfig>({ hours: 1, minutes: 0 })
  const [locked, setLocked] = useState(false)
  const [lockedAt, setLockedAt] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [complete, code, cards, wl, timer, lk, lkAt] = await Promise.all([
        get(KEYS.SETUP_COMPLETE, false),
        get(KEYS.OVERRIDE_CODE, ''),
        get<NfcCard[]>(KEYS.NFC_CARDS, []),
        get<string[]>(KEYS.WHITELIST, []),
        get<TimerConfig>(KEYS.TIMER_CONFIG, { hours: 1, minutes: 0 }),
        get(KEYS.LOCKED, false),
        get<string | null>(KEYS.LOCKED_AT, null),
      ])

      let finalCode = code
      if (!finalCode) {
        finalCode = generateOverrideCode()
        await set(KEYS.OVERRIDE_CODE, finalCode)
      }

      setSetupComplete(complete)
      setOverrideCode(finalCode)
      setNfcCards(cards)
      setWhitelist(wl)
      setTimerConfig(timer)
      setLocked(lk)
      setLockedAt(lkAt)
    }
    load()
  }, [])

  const saveSetupComplete = useCallback(async (v: boolean) => {
    await set(KEYS.SETUP_COMPLETE, v)
    setSetupComplete(v)
  }, [])

  const saveNfcCards = useCallback(async (cards: NfcCard[]) => {
    await set(KEYS.NFC_CARDS, cards)
    setNfcCards(cards)
  }, [])

  const saveWhitelist = useCallback(async (wl: string[]) => {
    await set(KEYS.WHITELIST, wl)
    setWhitelist(wl)
  }, [])

  const saveTimerConfig = useCallback(async (config: TimerConfig) => {
    await set(KEYS.TIMER_CONFIG, config)
    setTimerConfig(config)
  }, [])

  const saveLockState = useCallback(async (isLocked: boolean) => {
    const now = isLocked ? new Date().toISOString() : null
    await Promise.all([set(KEYS.LOCKED, isLocked), set(KEYS.LOCKED_AT, now)])
    setLocked(isLocked)
    setLockedAt(now)
  }, [])

  return {
    setupComplete,
    overrideCode,
    nfcCards,
    whitelist,
    timerConfig,
    locked,
    lockedAt,
    saveSetupComplete,
    saveNfcCards,
    saveWhitelist,
    saveTimerConfig,
    saveLockState,
  }
}
