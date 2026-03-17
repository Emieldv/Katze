import { useEffect, useRef, useState } from 'react'
import KatzePlugin from '../plugins/KatzePlugin'
import type { PluginListenerHandle } from '@capacitor/core'

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
    setScanning(true)
  }

  async function stopScan() {
    if (!scanning) return

    await KatzePlugin.stopNfcScan()
    listenerRef.current?.remove()
    listenerRef.current = null
    setScanning(false)
  }

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        KatzePlugin.stopNfcScan()
        listenerRef.current.remove()
      }
    }
  }, [])

  return { scanning, startScan, stopScan }
}
