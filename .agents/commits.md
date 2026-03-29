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

## Pull request titles

PR titles **must** follow the same conventional commit format as commit messages (`type(scope): description`). This is enforced by the `amannn/action-semantic-pull-request` GitHub Action and used by Release Please to auto-generate changelogs.

## Releases

Managed by [Release Please](https://github.com/googleapis/release-please). It reads conventional commits to auto-generate changelogs and version bumps.
