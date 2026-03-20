# Component Development

## DRY principle

Follow the DRY (Don't Repeat Yourself) principle strictly:

- Before writing any UI markup, check if an existing component in `src/components/` already covers the pattern
- If you see the same styling or markup repeated across files, extract it into a shared component
- When creating a new component, check the existing codebase for similar patterns and consolidate

### Available UI primitives

These components exist and must be used instead of writing inline markup:

- **Button** — block-level action buttons (`primary`, `outline`, `danger`, `ghost` variants)
- **LinkButton** — inline text actions (`primary`, `muted`, `danger` variants, optional `underline`)
- **TextInput** — text input fields (`default`, `surface` variants)
- **Checkbox** — custom styled checkbox with optional label
- **Spinner** — loading indicator (`sm`, `md`, `lg` sizes)
- **AlertBanner** — status banners (`error`, `warning`, `info` variants, optional action)
- **TabBar** — tab navigation (generic typed)
- **NumberStepper** — +/- stepper with label, min/max/step
- **SafeArea** — layout wrapper with safe area insets
- **AppListItem** — app list row with icon, name, package, checkbox
- **NfcCardItem** — NFC card row with rename/remove actions

### When to extract

- If a UI pattern appears in 2+ places, extract it
- If a UI pattern appears once but is a standard primitive (button, input, checkbox), extract it anyway — it will be reused
