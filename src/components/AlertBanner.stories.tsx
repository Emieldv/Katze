import { expect, fn, userEvent, within } from 'storybook/test'

import AlertBanner from './AlertBanner'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/AlertBanner',
  component: AlertBanner,
  argTypes: {
    variant: { control: 'radio', options: ['error', 'warning', 'info'] },
  },
} satisfies Meta<typeof AlertBanner>

export default meta
type Story = StoryObj<typeof meta>

// biome-ignore lint/suspicious/noShadowRestrictedNames: Storybook story name
export const Error: Story = {
  args: {
    variant: 'error',
    content: 'Accessibility service is not enabled. App blocking will not work.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    content: 'Timer is set to zero. Apps will unlock immediately.',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    content: 'NFC scanning is active. Hold your card near the phone.',
  },
}

export const WithAction: Story = {
  args: {
    variant: 'error',
    content: 'Accessibility service is not enabled. App blocking will not work.',
    action: { label: 'Open Accessibility Settings', onClick: fn() },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open Accessibility Settings' }))
    await expect(args.action!.onClick).toHaveBeenCalledOnce()
  },
}
