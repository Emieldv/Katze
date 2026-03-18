import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignore: ['android/**', 'vite.config.ts', 'src/vite-env.d.ts'],
  // Disable Vite plugin to avoid loading vite.config.ts in CI,
  // which fails due to missing native lightningcss binary
  vite: false,
  entry: ['src/main.tsx', 'src/test/setup.ts', '.storybook/main.ts', '.storybook/preview.ts'],
  ignoreDependencies: ['@tailwindcss/vite', '@vitejs/plugin-react', '@storybook/addon-a11y', '@storybook/addon-docs'],
}

export default config
