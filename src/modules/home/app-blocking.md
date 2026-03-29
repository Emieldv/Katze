# App Blocking

The home screen is the main interface for locking and unlocking app access.

## Lock/unlock flow

1. User taps registered NFC card (detected via global listener in `App.tsx`)
2. Card UID is verified against stored `nfcCards`
3. `saveLockState(newState)` persists to storage (sets `lockedAt` timestamp when locking)
4. `setLockState()` sends whitelist + timer duration to the native Accessibility Service
5. Native service blocks/allows app launches based on whitelist

The global NFC listener in `App.tsx` works on all screens. It skips processing if a local NFC scan is active (e.g., card registration in settings).

## Auto-unlock timer

- Countdown calculated from `lockedAt` + `timerConfig` (hours/minutes)
- Polls every 1 second while locked, displays remaining time as HH:MM:SS
- When timer expires: unlocks via same `saveLockState(false)` + `setLockState(false)` flow
- App resume syncs with native state — handles timer expiring while app is backgrounded

## Emergency override

- Tapping "Emergency Override" reveals a code input field
- Validates against the 16-character override code generated during setup
- On match: unlocks the system via the standard unlock flow

## Accessibility Service check

- Polls `isAccessibilityEnabled()` every 3 seconds
- Shows a red `AlertBanner` with link to settings if disabled
- Required for the native blocking to function

## Key dependencies

- `useAppBlocker` — bridge to native Accessibility Service and DND
- `useStorage` — persisted lock state, whitelist, timer config, override code
- `KatzePlugin` — native plugin for notification permissions and NFC listeners
