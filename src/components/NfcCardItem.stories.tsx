import { fn } from 'storybook/test'

import NfcCardItem from './NfcCardItem'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/NfcCardItem',
  component: NfcCardItem,
  args: {
    onRename: fn(),
    onRemove: fn(),
  },
  argTypes: {
    onRename: { table: { disable: true } },
    onRemove: { table: { disable: true } },
  },
} satisfies Meta<typeof NfcCardItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    uid: 'A1:B2:C3:D4',
    name: 'Desk card',
  },
}
