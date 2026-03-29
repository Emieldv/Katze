# Katze

![Coverage](https://img.shields.io/endpoint?url=https://emieldv.github.io/Katze/coverage/badge.json)

Open-source Android app blocker that uses NFC cards to lock and unlock access to apps. Designed for focus and digital wellbeing.

## How it works

1. Register 2+ NFC cards during setup
2. Tap a card to lock your phone — selected apps are blocked via Android's Accessibility Service
3. Tap again to unlock, or wait for the auto-unlock timer
4. Emergency override code available if you lose your cards

## Tech stack

- **UI:** React 19, React Router 7, Tailwind CSS 4
- **Native:** Capacitor 8 (Android)
- **Build:** Vite 6, TypeScript 5.7
- **Testing:** Vitest, Storybook 10, Playwright
- **Code quality:** Biome, Knip, commitlint
- **CI/CD:** GitHub Actions, Release Please, Fastlane

## Getting started

### Prerequisites

- Node.js (see `.nvmrc`)
- Android Studio (for device/emulator builds)
- Java 21 (for Android builds)

### Install and run

```bash
npm install
npm run dev          # Start Vite dev server
npm run storybook    # Start Storybook on port 6006
```

### Run checks

```bash
npm run lint         # Biome lint + format check
npm run test         # All tests (unit + storybook)
npm run test:unit    # Unit tests only
npm run test:storybook # Storybook interaction tests
npm run knip         # Detect unused code/dependencies
```

### Build Android APK

```bash
npm run build                       # Build web assets
npx cap sync android                # Sync to Android project
```

Then open `android/` in Android Studio to build and run on a device or emulator.

## Project structure

```
src/
  components/       # Reusable UI primitives
  modules/
    home/           # Lock/unlock screen
    settings/       # App whitelist, NFC cards, timer config
    setup/          # Onboarding flow
  hooks/            # Shared hooks (NFC, storage, app blocker)
  plugins/          # Capacitor native plugin interface
  utils/            # Pure utility functions
.agents/            # Convention docs for AI agents and developers
.github/workflows/  # CI/CD pipelines
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, branch naming, commit conventions, and how to submit a pull request.

## License

GPL-3.0-only. See [LICENSE](LICENSE).
