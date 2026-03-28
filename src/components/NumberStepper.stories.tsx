import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import NumberStepper from './NumberStepper'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/NumberStepper',
  component: NumberStepper,
  args: {
    onChange: fn(),
  },
  argTypes: {
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
  },
  decorators: [
    (Story, context) => {
      const [value, setValue] = useState(context.args.value)
      return (
        <Story
          args={{
            ...context.args,
            value,
            onChange: (v: number) => {
              setValue(v)
              context.args.onChange(v)
            },
          }}
        />
      )
    },
  ],
} satisfies Meta<typeof NumberStepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  globals: {
    backgrounds: { value: 'surface-light' },
  },
  args: {
    label: 'Hours',
    value: 2,
    min: 0,
    max: 24,
    step: 1,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)

    await step('Increments value when clicking +', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '+' }))
      await expect(args.onChange).toHaveBeenLastCalledWith(3)
    })

    await step('Decrements value when clicking -', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '-' }))
      await expect(args.onChange).toHaveBeenLastCalledWith(2)
    })
  },
}

export const ClampsAtMin: Story = {
  globals: {
    backgrounds: { value: 'surface-light' },
  },
  args: {
    label: 'Hours',
    value: 0,
    min: 0,
    max: 24,
    step: 1,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    await step('Clamps at minimum when clicking -', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '-' }))
      await expect(args.onChange).toHaveBeenLastCalledWith(0)
    })
  },
}

export const ClampsAtMax: Story = {
  globals: {
    backgrounds: { value: 'surface-light' },
  },
  args: {
    label: 'Hours',
    value: 24,
    min: 0,
    max: 24,
    step: 1,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)
    await step('Clamps at maximum when clicking +', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '+' }))
      await expect(args.onChange).toHaveBeenLastCalledWith(24)
    })
  },
}
