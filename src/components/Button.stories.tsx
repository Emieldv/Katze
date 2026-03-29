import { expect, fn, userEvent, within } from 'storybook/test'

import Button from './Button'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Button',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'outline', 'danger', 'ghost'] },
    onClick: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    await step('Click fires onClick callback', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Button' }))
      await expect(args.onClick).toHaveBeenCalledOnce()
    })
  },
}

export const Variants: Story = {
  render: () => (
    <div className='flex flex-col items-start gap-4'>
      <Button variant='primary'>Primary</Button>
      <Button variant='outline'>Outline</Button>
      <Button variant='danger'>Danger</Button>
      <Button variant='ghost'>Ghost</Button>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Continue',
    disabled: true,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    await step('Click does not fire onClick when disabled', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
      await expect(args.onClick).not.toHaveBeenCalled()
    })
  },
}

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    children: 'Continue',
    fullWidth: true,
  },
}
