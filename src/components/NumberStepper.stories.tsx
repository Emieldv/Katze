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
  decorators: [
    (Story, context) => {
      const [value, setValue] = useState(context.args.value)
      return <Story args={{ ...context.args, value, onChange: setValue }} />
    },
  ],
} satisfies Meta<typeof NumberStepper>

export default meta
type Story = StoryObj<typeof meta>

export const Hours: Story = {
  args: {
    label: 'Hours',
    value: 2,
    min: 0,
    max: 24,
  },
}

export const Minutes: Story = {
  args: {
    label: 'Minutes',
    value: 30,
    min: 0,
    max: 59,
    step: 5,
  },
}

export const AtMinimum: Story = {
  args: {
    label: 'Value',
    value: 0,
    min: 0,
    max: 10,
  },
}

export const AtMaximum: Story = {
  args: {
    label: 'Value',
    value: 10,
    min: 0,
    max: 10,
  },
}
