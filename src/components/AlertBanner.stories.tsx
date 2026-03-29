import { expect, fn, userEvent, within } from 'storybook/test'

import AlertBanner from './AlertBanner'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/AlertBanner',
  component: AlertBanner,
  args: {
    content: 'Something went wrong.',
  },
  argTypes: {
    variant: { control: 'radio', options: ['error', 'warning', 'info'] },
  },
} satisfies Meta<typeof AlertBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'Something went wrong.',
  },
}

export const Variants: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <AlertBanner variant='error' content='Accessibility service is not enabled. App blocking will not work.' />
      <AlertBanner variant='warning' content='Timer is set to zero. Apps will unlock immediately.' />
      <AlertBanner variant='info' content='NFC scanning is active. Hold your card near the phone.' />
    </div>
  ),
}

export const WithAction: Story = {
  args: {
    variant: 'error',
    content: 'Accessibility service is not enabled. App blocking will not work.',
    action: { label: 'Open Accessibility Settings', onClick: fn() },
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    await step('Action button fires onClick callback', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Open Accessibility Settings' }))
      await expect(args.action?.onClick).toHaveBeenCalledOnce()
    })
  },
}
