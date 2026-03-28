import type { Preview } from '@storybook/react-vite'

import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        surface: { name: 'Surface', value: 'oklch(0.15 0.01 150)' },
        'surface-light': { name: 'Surface Light', value: 'oklch(0.2 0.01 150)' },
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  initialGlobals: {
    backgrounds: { value: 'surface' },
  },
}

export default preview
