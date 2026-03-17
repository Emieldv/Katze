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

  const setLockState = useCallback(async (locked: boolean, whitelist: string[]) => {
    const fullWhitelist = [...new Set([...whitelist, 'com.katze.app'])]
    await KatzePlugin.setLockState({ locked, whitelist: fullWhitelist })
  }, [])

  return {
    accessibilityEnabled,
    checkAccessibility,
    openAccessibilitySettings,
    setLockState,
  }
}
