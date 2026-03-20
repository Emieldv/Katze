import { fn } from 'storybook/test'

import Button from './Button'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Button',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'outline', 'danger', 'ghost'] },
    onClick: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Continue',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Open Settings',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Unlock with Override',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Cancel',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Continue',
    disabled: true,
  },
}

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    children: 'Continue',
    fullWidth: true,
  },
}
