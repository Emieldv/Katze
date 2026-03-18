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
  decorators: [
    (Story, context) => {
      const [activeTab, setActiveTab] = useState(context.args.activeTab)
      return <Story args={{ ...context.args, activeTab, onTabChange: setActiveTab }} />
    },
  ],
} satisfies Meta<typeof TabBar>

export default meta
type Story = StoryObj<typeof meta>

export const ThreeTabs: Story = {
  args: {
    tabs: [
      { key: 'apps', label: 'Apps' },
      { key: 'nfc', label: 'NFC Cards' },
      { key: 'timer', label: 'Timer' },
    ],
    activeTab: 'apps',
  },
}

export const TwoTabs: Story = {
  args: {
    tabs: [
      { key: 'on', label: 'Enabled' },
      { key: 'off', label: 'Disabled' },
    ],
    activeTab: 'on',
  },
}
