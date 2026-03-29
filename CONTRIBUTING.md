# Contributing to Katze

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Development setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/Emieldv/Katze.git
cd Katze
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. For Android development, open the `android/` folder in Android Studio after syncing:

```bash
npm run build
npx cap sync android
```

## Branch naming

Create branches from `main` using this pattern:

```
<type>/<ticket-number>-description
```

Examples: `feat/13-project-documentation`, `fix/42-timer-reset-bug`

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Commits are validated by commitlint via a pre-commit hook.

Format: `type(scope): description`

Allowed types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

Examples:
- `feat(setup): add NFC card registration flow`
- `fix(home): resolve timer not resetting on unlock`
- `docs: update contributing guide`

PR titles follow the same format — validated by CI.

## Running checks locally

Before pushing, make sure these pass:

```bash
npm run lint         # Biome lint + format check
npm run test         # All tests
npm run knip         # Unused code detection
npm run build        # TypeScript + Vite build
```

## Code style

- Formatting and linting are handled by [Biome](https://biomejs.dev/) — no manual style decisions needed
- Run `npm run format` to auto-fix formatting
- Match the conventions of surrounding code

## Pull requests

- One logical change per PR
- PR title must follow conventional commit format
- Include a description of what changed and why
- Link the related issue (e.g., `Closes #13`)

## Storybook

When modifying presentational components in `src/components/`, update or create the corresponding Storybook story. See `.agents/storybook.md` for conventions.

Run Storybook locally:

```bash
npm run storybook
```

## Questions?

Open an issue or start a discussion if something is unclear.
