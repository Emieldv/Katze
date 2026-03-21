import { useState } from 'react'
import { fn } from 'storybook/test'

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
}
