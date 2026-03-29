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

## Component development

When adding or editing components, always create or edit its corresponding Storybook story. This ensures the component is documented and tested in isolation, and provides a reference for how it should be used.

### Storybook MCP

This project uses the Storybook MCP addon (`@storybook/addon-mcp`) to expose component documentation to AI agents. The MCP server is available at `http://localhost:6006/mcp` when Storybook is running (included in `npm run dev`).

**Setup:** If the `katze-storybook` MCP server is not yet configured in your agent, register it:

```bash
npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project
```

When working on UI components, always use the `katze-storybook` MCP tools to access Storybook's component and documentation knowledge before answering or taking any action.

- **CRITICAL: Never hallucinate component properties!** Before using ANY property on a component from a design system (including common-sounding ones like `shadow`, etc.), you MUST use the MCP tools to check if the property is actually documented for that component.
- Query `list-all-documentation` to get a list of all components
- Query `get-documentation` for that component to see all available properties and examples
- Only use properties that are explicitly documented or shown in example stories
- If a property isn't documented, do not assume properties based on naming conventions or common patterns from other libraries. Check back with the user in these cases.
- Use the `get-storybook-story-instructions` tool to fetch the latest instructions for creating or updating stories. This will ensure you follow current conventions and recommendations.
- Check your work by running `run-story-tests`.

Remember: A story name might not reflect the property name correctly, so always verify properties through documentation or example stories before using them.

### Component documentation

Autodocs is enabled globally — every component with stories gets a generated doc page. TypeScript types already provide prop names, types, required/optional status, and defaults. JSDoc comments add the human-readable layer on top.

**Always add when creating or editing a component:**

- A **component-level JSDoc** on the default export describing what the component is and when to use it
- **Prop-level JSDoc** on any prop where the name and type alone don't convey the full meaning

**Skip JSDoc for props that are self-explanatory** from their name and type (e.g. `label: string`, `onChange: (value: number) => void`).

```tsx
type ButtonProps = {
  /** Visual style of the button. */
  variant?: 'primary' | 'outline' | 'danger' | 'ghost'
  /** Stretches the button to fill its container width. */
  fullWidth?: boolean
}

/** Primary action button with multiple visual variants. */
export default function Button({ variant = 'primary', fullWidth = false }: ButtonProps) {
```

### DRY principle

- Before writing any UI markup, check if an existing component already covers the pattern
- If the same styling or markup is repeated across files, extract it into a shared component
- When creating a new component, check the existing codebase for similar patterns and consolidate

### When to extract

- A UI pattern appears in 2+ places — extract it
- A UI pattern appears once but is a standard primitive (button, input, checkbox) — extract it anyway, it will be reused
