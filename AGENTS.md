# Katze

Open-source Android app blocker with NFC unlock, built with React 19 + Capacitor + Tailwind CSS.

## Project structure

```
src/
  components/          # Reusable UI primitives (dumb, stateless or minimally stateful)
  modules/
    <feature>/
      screens/         # Page-level components
      components/      # Feature-specific components (only used within this module)
      hooks/           # Feature-specific hooks
  hooks/               # Shared hooks (used across modules)
  plugins/             # Capacitor native plugins
  types.ts             # Shared types
```

- **`src/components/`** — only reusable primitives that are used across multiple modules
- **`src/modules/<feature>/components/`** — components specific to one feature/module
- Stories live next to their component regardless of location

## Workflow

Before starting any task:

1. List the contents of `docs/` to discover available documentation
2. Read any docs relevant to the task at hand
3. Follow the conventions described in those docs

## Rules

- When creating or modifying a presentational component in `src/components/`, always create or update its Storybook story file. See `docs/storybook.md` for conventions.
- Follow the DRY principle. Before writing UI markup, check if an existing component covers the pattern. See `docs/components.md` for the component inventory.
