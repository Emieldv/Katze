# Setup / Onboarding

Four-step onboarding flow shown on first launch. Must be completed before accessing the app.

## Step 1 — Emergency override code

- Generates a 16-character alphanumeric code (excludes ambiguous chars: `0`, `O`, `1`, `l`, `I`)
- Displayed to the user with instruction to write it down
- Checkbox confirmation required before continuing
- Code is persisted via `useStorage.saveOverrideCode()` — generated once, never changes

## Step 2 — Accessibility Service

- Instructions to enable the Katze Accessibility Service
- Button opens native settings via `KatzePlugin.openAccessibilitySettings()`
- Polls `isAccessibilityEnabled()` every 1.5 seconds
- Auto-advances to step 3 when enabled

## Step 3 — Do Not Disturb

- Instructions to grant DND policy access (silences app notifications while locked, calls/texts still work)
- Button opens DND settings via `KatzePlugin.openDndSettings()`
- Polls `isDndPolicyGranted()` every 1.5 seconds
- Auto-advances to step 4 when granted

## Step 4 — NFC card registration

- Minimum 2 cards required
- Flow per card: start scan → detect UID → enter name → confirm
- Duplicate UIDs are rejected
- Shows list of registered cards with counter
- "Finish Setup" saves cards and marks setup complete, navigates to home

## Routing

- `/setup` is the default route when `setupComplete` is false
- After completion: redirects to `/` (home)
- `/settings` redirects to `/setup` if setup is not complete

## Key dependencies

- `useStorage` — override code, NFC cards, setup completion flag
- `useNfc` — scan lifecycle for card registration
- `KatzePlugin` — native settings navigation, DND and accessibility checks
- `generateOverrideCode()` from `utils/codeGenerator`
