import { ArrowLeft } from '@phosphor-icons/react'
import { expect, fn, userEvent, within } from 'storybook/test'

import LinkButton from './LinkButton'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/LinkButton',
  component: LinkButton,
  args: {
    text: 'LinkButton',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'muted', 'danger'] },
    size: { control: 'radio', options: ['small', 'medium'] },
    onClick: { table: { disable: true } },
    className: { table: { disable: true } },
    icon: { table: { disable: true } },
  },
} satisfies Meta<typeof LinkButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    text: 'Save',
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    await step('Click fires onClick callback', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
      await expect(args.onClick).toHaveBeenCalledOnce()
    })
  },
}

export const Variants: Story = {
  render: () => (
    <div className='flex flex-col items-start gap-4'>
      <LinkButton variant='primary' text='Save' />
      <LinkButton variant='muted' text='Rename' />
      <LinkButton variant='danger' text='Remove' />
    </div>
  ),
}

export const Underline: Story = {
  args: {
    variant: 'muted',
    text: 'Cancel',
    underline: true,
  },
}

export const WithIcon: Story = {
  args: {
    size: 'medium',
    text: 'Back',
    icon: <ArrowLeft className='w-4 h-4' />,
  },
}
