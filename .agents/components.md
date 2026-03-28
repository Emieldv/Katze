# Component Development

## DRY principle

- Before writing any UI markup, check if an existing component already covers the pattern
- If the same styling or markup is repeated across files, extract it into a shared component
- When creating a new component, check the existing codebase for similar patterns and consolidate

## Shared primitives (`src/components/`)

These components exist and must be used instead of writing inline markup:

| Component | Purpose |
|-----------|---------|
| `Button` | Primary actions. Variants: `primary`, `outline`, `danger`, `ghost` |
| `LinkButton` | Text links/actions. Variants: `primary`, `muted`, `danger`. Sizes: `small`, `medium` |
| `TextInput` | Text input fields. Variants: `default`, `surface` |
| `Checkbox` | Accessible checkbox with label |
| `NumberStepper` | Numeric +/- control with min/max/step |
| `TabBar` | Generic typed tab navigation |
| `AlertBanner` | Notices/warnings. Variants: `error`, `warning`, `info` |
| `Spinner` | Loading indicator. Sizes: `sm`, `md`, `lg` |
| `SafeArea` | Viewport container with safe area insets |

## When to extract

- A UI pattern appears in 2+ places — extract it
- A UI pattern appears once but is a standard primitive (button, input, checkbox) — extract it anyway, it will be reused
