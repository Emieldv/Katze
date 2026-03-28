import { expect, fn, userEvent, within } from 'storybook/test'

import LinkButton from './LinkButton'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/LinkButton',
  component: LinkButton,
  args: {
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

export const Primary: Story = {
  args: {
    variant: 'primary',
    text: 'Save',
    size: 'medium',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const Muted: Story = {
  args: {
    variant: 'muted',
    text: 'Rename',
    size: 'medium',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    text: 'Remove',
    size: 'medium',
  },
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
    icon: (
      <svg viewBox='0 0 20 20' fill='currentColor' className='w-4 h-4'>
        <path
          fillRule='evenodd'
          d='M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z'
          clipRule='evenodd'
        />
      </svg>
    ),
  },
}
