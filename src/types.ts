export interface NfcCard {
  uid: string
  name: string
  registeredAt: string
}

export interface InstalledApp {
  packageName: string
  appName: string
  icon: string
}

export interface TimerConfig {
  hours: number
  minutes: number
}

export interface AppState {
  setupComplete: boolean
  overrideCode: string
  nfcCards: NfcCard[]
  whitelist: string[]
  timerConfig: TimerConfig
  locked: boolean
  lockedAt: string | null
}
