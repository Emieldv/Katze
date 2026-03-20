import { fn } from 'storybook/test'

import AppListItem from './AppListItem'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/AppListItem',
  component: AppListItem,
  args: {
    onToggle: fn(),
    icon: 'https://placehold.co/40x40/4ade80/white?text=App',
  },
  argTypes: {
    onToggle: { table: { disable: true } },
  },
} satisfies Meta<typeof AppListItem>

export default meta
type Story = StoryObj<typeof meta>

export const Unselected: Story = {
  args: {
    appName: 'Instagram',
    packageName: 'com.instagram.android',
    selected: false,
  },
}

export const Selected: Story = {
  args: {
    appName: 'Instagram',
    packageName: 'com.instagram.android',
    selected: true,
  },
}

export const WithoutIcon: Story = {
  args: {
    appName: 'Unknown App',
    packageName: 'com.unknown.app',
    icon: '',
    selected: false,
  },
}
