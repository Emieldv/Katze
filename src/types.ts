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
