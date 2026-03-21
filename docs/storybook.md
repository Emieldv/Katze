# Storybook Conventions

## When to write stories

- Write stories for **presentational components** (`src/components/`)
- Do **not** write stories for page-level components (`src/pages/`) or app-level orchestrators (`App.tsx`) — they are too tightly coupled to hooks, routing, and native plugins

## Story selection

- Each story should represent a **meaningful visual state** — not a prop variation
- Good: error vs warning variant (different colors), zero-timer warning (edge case), with/without action button
- Bad: spinner in 3 sizes (just use a control knob), tab bar with 2 vs 3 tabs (no visual insight)

## Controls

- Hide all callback props (`onClick`, `onChange`, `onSave`, `onRemove`, etc.) from the controls panel using `argTypes: { propName: { table: { disable: true } } }` — they clutter the UI and aren't meaningful to edit. Still pass them via `args` with `fn()` so they log in the Actions panel.
- Hide internal state props (`value`, `activeTab` for controlled components) from the controls panel the same way
- Hide `className` from the controls panel on all stories — it's a developer concern, not something Storybook visitors should edit
- Use `fn()` from `storybook/test` for all callback props — this logs interactions in the Actions panel
- When a decorator manages state (e.g., `useState` for controlled components), call **both** the state setter and `context.args.callback` so the Actions panel still logs

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

- The default Storybook background matches the app's `surface` color
- Components that normally render inside a card (`bg-surface-light`) may have buttons invisible against the default background — use `globals: { backgrounds: { value: 'surface-light' } }` on those stories
- Do **not** use decorators to fake card backgrounds — it looks like part of the component

## Nested object props

- Use the default JSON control for object props (e.g., `action: { label, onClick }`)
- Do not install addons to decompose nested objects into separate controls — the trade-offs aren't worth it for this project
