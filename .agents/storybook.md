# Storybook Conventions

## When to write stories

- Write stories for **presentational components** (`src/components/`)
- Do **not** write stories for page-level components (`screens/`) or app-level orchestrators (`App.tsx`) — they are too tightly coupled to hooks, routing, and native plugins

## Story selection

- Each story should represent a **meaningful visual state** — not a prop variation
- Good: error vs warning variant (different colors), zero-timer warning (edge case), with/without action button
- Bad: spinner in 3 sizes (just use a control knob), tab bar with 2 vs 3 tabs (no visual insight)

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
