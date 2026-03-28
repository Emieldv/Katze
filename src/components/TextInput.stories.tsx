import { expect, fn, userEvent, within } from 'storybook/test'

import TextInput from './TextInput'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/TextInput',
  component: TextInput,
  args: {
    onChange: fn(),
  },
  argTypes: {
    variant: { control: 'radio', options: ['default', 'surface'] },
    onChange: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Search apps...',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Search apps...')
    await userEvent.type(input, 'Instagram')
    await expect(input).toHaveValue('Instagram')
    await expect(args.onChange).toHaveBeenCalled()
  },
}

export const Surface: Story = {
  args: {
    variant: 'surface',
    placeholder: 'Enter your emergency code',
    className: 'font-mono',
  },
  globals: {
    backgrounds: { value: 'surface-light' },
  },
}
