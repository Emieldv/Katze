# Storybook Conventions

## When to write stories

- Write stories for **presentational components** (`src/components/`)
- Do **not** write stories for page-level components (`screens/`) or app-level orchestrators (`App.tsx`) — they are too tightly coupled to hooks, routing, and native plugins

## Story structure

Every component's stories must follow this structure:

1. **`Default`** — the component with only its **required props** populated (plus a minimal realistic value). This is the baseline story and should always be first.
2. **`Variants`** — if the component has **style variants** (e.g., color schemes, visual modes), render all of them in a single story using a custom `render` function. Use a flex container to lay them out.
3. **Separate stories for functional variants** — any story that tests **behavior** (play functions), **feature flags** (e.g., `disabled`, `fullWidth`, `withIcon`), or **edge cases** (e.g., `ZeroTimer`, `WithoutIcon`) stays as its own story. This keeps interaction tests isolated and easy to debug.

```tsx
// Example: component with style variants and a functional variant
export const Default: Story = {
  args: { content: 'Something went wrong.' },
}

export const Variants: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <AlertBanner variant='error' content='Error message' />
      <AlertBanner variant='warning' content='Warning message' />
      <AlertBanner variant='info' content='Info message' />
    </div>
  ),
}

export const WithAction: Story = {
  args: { /* ... */ },
  play: async ({ canvasElement, args, step }) => { /* ... */ },
}
```

### What counts as a style variant vs functional variant

- **Style variant** → purely visual difference (colors, sizes, themes) with no behavior change → goes in `Variants`
- **Functional variant** → changes behavior, has a play function, or tests an edge case → separate story

## Controls

- Hide callback props (`onClick`, `onChange`, etc.) from controls via `argTypes: { propName: { table: { disable: true } } }` — still pass them via `args` with `fn()` so they log in the Actions panel
- Hide internal state props (`value`, `activeTab` for controlled components) the same way
- Hide `className` from controls on all stories
- Use `fn()` from `storybook/test` for all callback props
- When a decorator manages state, call **both** the state setter and `context.args.callback` so Actions still logs

```tsx
decorators: [
  (Story, context) => {
    const [value, setValue] = useState(context.args.value)
    return (
      <Story
        args={{
          ...context.args,
          value,
          onChange: (v: number) => {
            setValue(v)
            context.args.onChange(v)
          },
        }}
      />
    )
  },
],
```

## Backgrounds

- Default Storybook background matches the app's `surface` color
- Components inside cards (`bg-surface-light`) may be invisible against the default — use `globals: { backgrounds: { value: 'surface-light' } }` on those stories
- Do **not** use decorators to fake card backgrounds

## Nested object props

- Use the default JSON control for object props (e.g., `action: { label, onClick }`)
- Do not install addons to decompose nested objects into separate controls
