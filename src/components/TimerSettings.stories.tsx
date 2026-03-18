import { useState } from 'react'
import { fn } from 'storybook/test'

import TimerSettings from './TimerSettings'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { TimerConfig } from '../types'

const meta = {
  title: 'Components/TimerSettings',
  component: TimerSettings,
  args: {
    onSave: fn(),
  },
  decorators: [
    (Story, context) => {
      const [config, setConfig] = useState<TimerConfig>(context.args.config)
      return <Story args={{ ...context.args, config, onSave: async (c: TimerConfig) => setConfig(c) }} />
    },
  ],
} satisfies Meta<typeof TimerSettings>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    config: { hours: 2, minutes: 30 },
  },
}

export const ZeroTimer: Story = {
  args: {
    config: { hours: 0, minutes: 0 },
  },
}

export const HoursOnly: Story = {
  args: {
    config: { hours: 8, minutes: 0 },
  },
}

export const MinutesOnly: Story = {
  args: {
    config: { hours: 0, minutes: 45 },
  },
}
