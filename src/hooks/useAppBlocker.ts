import { useState, useCallback } from 'react'
import KatzePlugin from '../plugins/KatzePlugin'

export function useAppBlocker() {
  const [accessibilityEnabled, setAccessibilityEnabled] = useState<boolean | null>(null)

  const checkAccessibility = useCallback(async () => {
    const { enabled } = await KatzePlugin.isAccessibilityEnabled()
    setAccessibilityEnabled(enabled)
    return enabled
  }, [])

  const openAccessibilitySettings = useCallback(async () => {
    await KatzePlugin.openAccessibilitySettings()
  }, [])

  const setLockState = useCallback(async (
    locked: boolean,
    whitelist: string[],
    timerConfig?: { hours: number; minutes: number },
  ) => {
    const fullWhitelist = [...new Set([...whitelist, 'com.katze.app'])]
    await KatzePlugin.setLockState({
      locked,
      whitelist: fullWhitelist,
      timerHours: timerConfig?.hours ?? 0,
      timerMinutes: timerConfig?.minutes ?? 0,
    })
  }, [])

  return {
    accessibilityEnabled,
    checkAccessibility,
    openAccessibilitySettings,
    setLockState,
  }
}
