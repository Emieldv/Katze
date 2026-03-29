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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    await step('Typing updates value and fires onChange', async () => {
      const input = canvas.getByPlaceholderText('Search apps...')
      await userEvent.type(input, 'Instagram')
      await expect(input).toHaveValue('Instagram')
      await expect(args.onChange).toHaveBeenCalled()
    })
  },
}

export const Variants: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <TextInput placeholder='Default variant' />
      <div className='bg-surface-light p-4 rounded-xl'>
        <TextInput variant='surface' placeholder='Surface variant' />
      </div>
    </div>
  ),
}
