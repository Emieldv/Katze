import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStorage } from './useStorage'

const store = new Map<string, string>()

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(({ key }: { key: string }) => Promise.resolve({ value: store.get(key) ?? null })),
    set: vi.fn(({ key, value }: { key: string; value: string }) => {
      store.set(key, value)
      return Promise.resolve()
    }),
  },
}))

// Mock to enable deterministic assertions on the generated code
vi.mock('../utils/codeGenerator', () => ({
  generateOverrideCode: () => 'TESTCODE12345678',
}))

beforeEach(() => {
  store.clear()
})

describe('useStorage', () => {
  it('loads default values on first use', async () => {
    const { result } = renderHook(() => useStorage())

    await waitFor(() => {
      expect(result.current.setupComplete).toBe(false)
    })

    expect(result.current.overrideCode).toBe('TESTCODE12345678')
    expect(result.current.nfcCards).toEqual([])
    expect(result.current.whitelist).toEqual([])
    expect(result.current.timerConfig).toEqual({ hours: 1, minutes: 0 })
    expect(result.current.locked).toBe(false)
    expect(result.current.lockedAt).toBeNull()
  })

  it('generates override code on first load', async () => {
    const { result } = renderHook(() => useStorage())

    await waitFor(() => {
      expect(result.current.overrideCode).toBe('TESTCODE12345678')
    })

    // Code should be persisted
    expect(store.get('katze_override_code')).toBe('"TESTCODE12345678"')
  })

  it('loads existing override code without regenerating', async () => {
    store.set('katze_override_code', '"EXISTINGCODE1234"')

    const { result } = renderHook(() => useStorage())

    await waitFor(() => {
      expect(result.current.overrideCode).toBe('EXISTINGCODE1234')
    })
  })

  it('saves and updates setup complete', async () => {
    const { result } = renderHook(() => useStorage())

    await waitFor(() => {
      expect(result.current.setupComplete).toBe(false)
    })

    await act(async () => {
      await result.current.saveSetupComplete(true)
    })

    expect(result.current.setupComplete).toBe(true)
    expect(store.get('katze_setup_complete')).toBe('true')
  })

  it('saves and updates NFC cards', async () => {
    const { result } = renderHook(() => useStorage())

    await waitFor(() => {
      expect(result.current.setupComplete).not.toBeNull()
    })

    const cards = [{ uid: 'ABC123', name: 'Test Card', registeredAt: '2026-01-01' }]

    await act(async () => {
      await result.current.saveNfcCards(cards)
    })

    expect(result.current.nfcCards).toEqual(cards)
  })

  it('saves and updates whitelist', async () => {
    const { result } = renderHook(() => useStorage())

    await waitFor(() => {
      expect(result.current.setupComplete).not.toBeNull()
    })

    const whitelist = ['com.example.app']

    await act(async () => {
      await result.current.saveWhitelist(whitelist)
    })

    expect(result.current.whitelist).toEqual(whitelist)
  })

  it('saves and updates timer config', async () => {
    const { result } = renderHook(() => useStorage())

    await waitFor(() => {
      expect(result.current.setupComplete).not.toBeNull()
    })

    await act(async () => {
      await result.current.saveTimerConfig({ hours: 2, minutes: 30 })
    })

    expect(result.current.timerConfig).toEqual({ hours: 2, minutes: 30 })
  })

  it('saves lock state with timestamp', async () => {
    const { result } = renderHook(() => useStorage())

    await waitFor(() => {
      expect(result.current.setupComplete).not.toBeNull()
    })

    await act(async () => {
      await result.current.saveLockState(true)
    })

    expect(result.current.locked).toBe(true)
    expect(result.current.lockedAt).toBeTruthy()
  })

  it('clears lock timestamp when unlocking', async () => {
    const { result } = renderHook(() => useStorage())

    await waitFor(() => {
      expect(result.current.setupComplete).not.toBeNull()
    })

    await act(async () => {
      await result.current.saveLockState(true)
    })

    expect(result.current.lockedAt).toBeTruthy()

    await act(async () => {
      await result.current.saveLockState(false)
    })

    expect(result.current.locked).toBe(false)
    expect(result.current.lockedAt).toBeNull()
  })
})
