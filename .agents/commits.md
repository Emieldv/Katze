# Commit & Branch Conventions

## Commit messages

Format: `type(scope): description`

Enforced by commitlint with `@commitlint/config-conventional`.

Allowed types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

- Scope is optional but encouraged (use ticket number or feature area)
- Subject case is not enforced
- Keep the subject line under 72 characters

Examples:
- `feat(setup): add NFC card registration flow`
- `fix(12): resolve timer not resetting on unlock`
- `chore: update dependencies`

## Branch naming

Pattern: `<type>/<ticket>-description`

Examples:
- `feat/13-project-documentation`
- `fix/42-timer-reset-bug`

## Releases

Managed by [Release Please](https://github.com/googleapis/release-please). It reads conventional commits to auto-generate changelogs and version bumps. PR titles are also validated against conventional commit format.
