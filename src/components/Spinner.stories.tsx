import Spinner from './Spinner'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
