import { useEffect, useRef, useState } from 'react'

import KatzePlugin from '../plugins/KatzePlugin'

import type { PluginListenerHandle } from '@capacitor/core'

// Module-level flag so the global NFC listener in App.tsx can
// skip handling when a local scan (e.g. adding a card) is active.
let activeScanCount = 0
export function isNfcScanActive() {
  return activeScanCount > 0
}

interface UseNfcOptions {
  onTagDetected: (uid: string) => void
}

export function useNfc({ onTagDetected }: UseNfcOptions) {
  const [scanning, setScanning] = useState(false)
  const listenerRef = useRef<PluginListenerHandle | null>(null)
  const callbackRef = useRef(onTagDetected)
  callbackRef.current = onTagDetected

  async function startScan() {
    if (scanning) return

    listenerRef.current = await KatzePlugin.addListener('nfcTagDetected', (event) => {
      callbackRef.current(event.uid)
    })

    await KatzePlugin.startNfcScan()
    activeScanCount++
    setScanning(true)
  }

  async function stopScan() {
    if (!scanning) return

    await KatzePlugin.stopNfcScan()
    listenerRef.current?.remove()
    listenerRef.current = null
    activeScanCount = Math.max(0, activeScanCount - 1)
    setScanning(false)
  }

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        KatzePlugin.stopNfcScan()
        listenerRef.current.remove()
        activeScanCount = Math.max(0, activeScanCount - 1)
      }
    }
  }, [])

  return { scanning, startScan, stopScan }
}
