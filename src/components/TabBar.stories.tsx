import { useState } from 'react'
import { fn } from 'storybook/test'

import TabBar from './TabBar'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/TabBar',
  component: TabBar,
  args: {
    onTabChange: fn(),
  },
  argTypes: {
    onTabChange: { table: { disable: true } },
  },
  decorators: [
    (Story, context) => {
      const [activeTab, setActiveTab] = useState(context.args.activeTab)
      return (
        <Story
          args={{
            ...context.args,
            activeTab,
            onTabChange: (tab: string) => {
              setActiveTab(tab)
              context.args.onTabChange(tab)
            },
          }}
        />
      )
    },
  ],
} satisfies Meta<typeof TabBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tabs: [
      { key: 'apps', label: 'Apps' },
      { key: 'nfc', label: 'NFC Cards' },
      { key: 'timer', label: 'Timer' },
    ],
    activeTab: 'apps',
  },
}
