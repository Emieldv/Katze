# Testing Conventions

## Setup

- **Framework:** Vitest 4 with two project configs
- **Unit tests:** jsdom environment (`npm run test:unit`)
- **Storybook tests:** Playwright browser (`npm run test:storybook`)
- **All tests:** `npm run test`

## Unit tests

- Test files live next to their source: `useStorage.test.ts` beside `useStorage.ts`
- Test hooks and utilities — not components (use Storybook for those)
- Mock native plugins (`@capacitor/preferences`, `KatzePlugin`) at module level
- Keep tests focused on behavior, not implementation details

## Storybook tests

- See [storybook-interaction-tests.md](storybook-interaction-tests.md) for play function conventions
- Every interactive component gets a play function
- Non-interactive components are covered by rendering alone

## What to test

| Layer | Tool | Example |
|-------|------|---------|
| Hooks | Vitest + `renderHook` | `useStorage`, `useNfc` |
| Utilities | Vitest | `codeGenerator` |
| Components (interactive) | Storybook play functions | `NumberStepper`, `Checkbox` |
| Components (visual only) | Storybook rendering | `Spinner`, `AlertBanner` |

## What NOT to test

- Page-level screens (`screens/`) — too coupled to routing and native plugins
- `App.tsx` routing logic
- Native plugin behavior (tested on device)
