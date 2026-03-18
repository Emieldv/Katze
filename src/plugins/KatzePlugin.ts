import { registerPlugin } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'
import type { InstalledApp } from '../types'

export interface NfcTagEvent {
  uid: string
}

export interface KatzePluginInterface {
  getInstalledApps(): Promise<{ apps: InstalledApp[] }>
  setLockState(options: { locked: boolean; whitelist: string[] }): Promise<void>
  isAccessibilityEnabled(): Promise<{ enabled: boolean }>
  openAccessibilitySettings(): Promise<void>
  startNfcScan(): Promise<void>
  stopNfcScan(): Promise<void>
  getPendingNfcTag(): Promise<{ uid: string | null }>
  addListener(
    eventName: 'nfcTagDetected',
    handler: (event: NfcTagEvent) => void,
  ): Promise<PluginListenerHandle>
}

const KatzePlugin = registerPlugin<KatzePluginInterface>('KatzePlugin')

export default KatzePlugin
