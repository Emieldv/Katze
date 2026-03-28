# Storybook Interaction Tests

## Goal

Regression coverage for component interactions via Storybook play functions.

## Infrastructure

- **Runner:** `@storybook/addon-vitest` with Vitest browser runner (Playwright/Chromium, headless)
- **Assertions:** `@storybook/test` — provides `expect`, `fn`, `userEvent`, `within`
- **Command:** `npm run test:storybook`

## What to test

Interactive components get play functions that verify:

1. **Callbacks fire** — click a button, assert `onClick` called with correct args
2. **State transitions** — toggle a checkbox, assert checked state visible
3. **Boundaries** — clamp at min/max, zero-timer warning appears
4. **Conditional rendering** — elements that show/hide based on props or interaction

## What NOT to test

- Pure visual components with no interactions (e.g., `Spinner`) — rendering the story is sufficient
- Layout wrappers (e.g., `SafeArea`) — no story, no test

## Pattern

```tsx
export const Default: Story = {
  args: { /* ... */ },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    await step('Increments value when clicking +', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '+' }))
      await expect(args.onChange).toHaveBeenCalled()
    })
  },
}
```

- **Always wrap assertions in `step()`** — shows readable labels in the interactions panel
- Use `within(canvasElement)` to scope queries
- Use `userEvent` for interactions
- Assert callbacks via `expect(args.callbackName).toHaveBeenCalledWith(expectedArgs)`
- Assert DOM state via `expect(element).toBeInTheDocument()` / `toHaveTextContent()`
