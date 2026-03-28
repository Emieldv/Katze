# Storybook Interaction Tests Strategy

## Goal

Regression coverage for all component interactions via Storybook play functions. Every component with user-facing interactions gets a play function that exercises those interactions and asserts correct behavior.

## Infrastructure

- **Test runner:** `@storybook/addon-vitest` integrated with Vitest browser runner (Playwright/Chromium, headless)
- **Assertions:** `@storybook/test` — provides `expect`, `fn`, `userEvent`, `within`
- **Execution:** `npx storybook test` runs all play functions as part of the test suite

## What to test

Every interactive component gets play functions that verify:

1. **Callbacks fire correctly** — click a button, assert `onClick` was called with correct args
2. **State transitions render** — toggle a checkbox, assert checked state is visible
3. **Boundary/edge cases** — clamp at min/max, zero-timer warning appears
4. **Conditional rendering** — elements that show/hide based on props or interaction

## What NOT to test

- **Pure visual components** with no interactions (e.g., `Spinner`) — no play function needed, rendering the story is sufficient
- **Layout wrappers** (e.g., `SafeArea`) — no story, no test
- **Visual regression** — deferred; may add Chromatic later for screenshot diffing

## Play function pattern

Stories use decorators with `useState` for controlled components. Play functions should:

- Use `within(canvasElement)` to scope queries
- Use `userEvent` for interactions (click, type, etc.)
- Assert callbacks via `expect(args.callbackName).toHaveBeenCalledWith(expectedArgs)`
- Assert DOM state via `expect(element).toBeInTheDocument()` / `toHaveTextContent()`

```tsx
export const Default: Story = {
  args: { /* ... */ },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: '+' })
    await userEvent.click(button)
    await expect(args.onChange).toHaveBeenCalled()
  },
}
```
