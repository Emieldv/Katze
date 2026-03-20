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
  },
  initialGlobals: {
    backgrounds: { value: 'surface' },
  },
}

export default preview
