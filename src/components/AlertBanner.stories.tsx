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

export const ErrorVariant: Story = {
  args: {
    variant: 'error',
    children: 'Accessibility service is not enabled. App blocking will not work.',
    action: { label: 'Open Accessibility Settings', onClick: () => {} },
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Timer is set to zero. Apps will unlock immediately.',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'NFC scanning is active. Hold your card near the phone.',
  },
}

export const WithoutAction: Story = {
  args: {
    variant: 'error',
    children: 'Something went wrong.',
  },
}
