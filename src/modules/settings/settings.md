# Settings

Three-tab settings screen: Apps, NFC Cards, Timer. Only accessible when the system is unlocked.

## Apps tab — whitelist management

- Loads installed apps via `KatzePlugin.getInstalledApps()`
- System apps are hidden: `com.katzefocus.app`, `com.android.settings`, `com.samsung.android.app.settings`
- Search filter (case-insensitive by app name)
- Checked apps are **whitelisted** — they will NOT be blocked when locked
- `com.katzefocus.app` is always auto-added to the whitelist in `useAppBlocker.setLockState()`

Components: `AppList` (container with search + list), `AppListItem` (row with icon, name, package name, checkbox)

## NFC Cards tab — card registration

- Lists registered cards with UID and editable name
- **Add card:** starts NFC scan → detects UID → prompts for name → saves
- **Rename:** inline edit with Save/Cancel
- **Remove:** allowed only if 2+ cards remain (minimum 2 required)
- Duplicate UIDs are rejected with a status message

Components: `NfcCardManager` (scan + list logic), `NfcCardItem` (card row with edit/remove actions)

Hook: `useNfc` for scan lifecycle

## Timer tab — auto-unlock duration

- Hour stepper (0–24, step 1) and minute stepper (0–59, step 5)
- Shows total duration formatted as e.g. "1h 30m"
- Warns if timer is 0 (would unlock immediately after locking)

Component: `TimerSettings` using `NumberStepper` primitives

## Data persistence

All settings are stored via `useStorage` → Capacitor Preferences:

| Key | Type | Description |
|-----|------|-------------|
| `katze_nfc_cards` | `NfcCard[]` | Registered cards with uid, name, registeredAt |
| `katze_whitelist` | `string[]` | Package names excluded from blocking |
| `katze_timer_config` | `{ hours, minutes }` | Auto-unlock duration |
