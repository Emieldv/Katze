import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import Checkbox from './Checkbox'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    onChange: fn(),
  },
  argTypes: {
    checked: { table: { disable: true } },
    onChange: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  decorators: [
    (Story, context) => {
      const [checked, setChecked] = useState(context.args.checked)
      return (
        <Story
          args={{
            ...context.args,
            checked,
            onChange: (v: boolean) => {
              setChecked(v)
              context.args.onChange(v)
            },
          }}
        />
      )
    },
  ],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'I have written down the override code and stored it in a safe place',
    checked: false,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole('button')

    await step('Toggles on when clicked', async () => {
      await userEvent.click(checkbox)
      await expect(args.onChange).toHaveBeenCalledWith(true)
    })

    await step('Toggles off when clicked again', async () => {
      await userEvent.click(checkbox)
      await expect(args.onChange).toHaveBeenCalledWith(false)
    })
  },
}
