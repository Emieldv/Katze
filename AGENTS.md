# Katze

Open-source Android app blocker with NFC unlock, built with React 19 + Capacitor + Tailwind CSS.

## Project structure

```
src/
  components/          # Reusable UI primitives (stateless or minimally stateful)
  modules/
    <feature>/
      screens/         # Page-level components
      components/      # Feature-specific components (only used within this module)
      hooks/           # Feature-specific hooks
  hooks/               # Shared hooks (used across modules)
  plugins/             # Capacitor native plugins
  utils/               # Pure utility functions
  types.ts             # Shared types
```

- `src/components/` — only reusable primitives used across multiple modules
- `src/modules/<feature>/components/` — components scoped to one module
- Stories live next to their component regardless of location

## Code style

- **Formatter/linter:** Biome (`npm run lint`, `npm run format`)
- **Config:** extends `@nimblestudio/biome-config` (root + react presets)
- **Unused code:** detected by Knip (`npm run knip`)
- Match the style and conventions of surrounding code — consistency within a file takes priority

## Workflow

Before starting any task:

1. Read `AGENTS.md` (this file) for structure and code style
2. Check the docs index below — read any that are relevant to the task
3. Follow the conventions described in those docs

## Convention docs (`.agents/`)

| File | When to read |
|------|-------------|
| [components.md](.agents/components.md) | Creating or modifying UI components |
| [storybook.md](.agents/storybook.md) | Writing or updating Storybook stories |
| [storybook-interaction-tests.md](.agents/storybook-interaction-tests.md) | Adding play functions or interaction tests |
| [testing.md](.agents/testing.md) | Writing or modifying tests |
| [commits.md](.agents/commits.md) | Creating commits or branches |

## Feature docs (co-located in modules)

| File | What it covers |
|------|---------------|
| [src/modules/home/app-blocking.md](src/modules/home/app-blocking.md) | Lock/unlock flow, timer, emergency override |
| [src/modules/settings/settings.md](src/modules/settings/settings.md) | App whitelist, NFC card management, timer config |
| [src/modules/setup/nfc-setup.md](src/modules/setup/nfc-setup.md) | Onboarding flow, permissions, NFC registration |

## Rules

- When creating or modifying a presentational component in `src/components/`, always create or update its Storybook story file
- Follow the DRY principle — check if an existing component covers the pattern before writing UI markup
