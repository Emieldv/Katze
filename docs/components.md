# Component Development

## DRY principle

Follow the DRY (Don't Repeat Yourself) principle strictly:

- Before writing any UI markup, check if an existing component already covers the pattern
- If you see the same styling or markup repeated across files, extract it into a shared component
- When creating a new component, check the existing codebase for similar patterns and consolidate

## Reusable UI primitives (`src/components/`)

These components exist and must be used instead of writing inline markup:

## When to extract

- If a UI pattern appears in 2+ places, extract it
- If a UI pattern appears once but is a standard primitive (button, input, checkbox), extract it anyway — it will be reused
