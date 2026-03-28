import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import TimerSettings from './TimerSettings'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { TimerConfig } from '../../../types'

const meta = {
  title: 'Components/TimerSettings',
  component: TimerSettings,
  args: {
    onSave: fn(),
  },
  argTypes: {
    onSave: { table: { disable: true } },
  },
  decorators: [
    (Story, context) => {
      const [config, setConfig] = useState<TimerConfig>(context.args.config)
      return (
        <Story
          args={{
            ...context.args,
            config,
            onSave: async (c: TimerConfig) => {
              setConfig(c)
              context.args.onSave(c)
            },
          }}
        />
      )
    },
  ],
} satisfies Meta<typeof TimerSettings>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    config: { hours: 2, minutes: 30 },
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)

    await step('Incrementing hours fires onSave with updated config', async () => {
      const plusButtons = canvas.getAllByRole('button', { name: '+' })
      await userEvent.click(plusButtons[0])
      await expect(args.onSave).toHaveBeenLastCalledWith({ hours: 3, minutes: 30 })
    })

    await step('Shows auto-unlock summary text', async () => {
      await expect(canvas.getByText(/Apps will auto-unlock after/)).toBeInTheDocument()
    })
  },
}

export const ZeroTimer: Story = {
  args: {
    config: { hours: 0, minutes: 0 },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Shows zero-timer warning', async () => {
      await expect(canvas.getByText('Timer cannot be zero — apps would unlock immediately.')).toBeInTheDocument()
    })
  },
}
