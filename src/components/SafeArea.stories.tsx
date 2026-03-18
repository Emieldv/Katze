import SafeArea from './SafeArea'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/SafeArea',
  component: SafeArea,
} satisfies Meta<typeof SafeArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className='flex-1 flex items-center justify-center'>
        <p className='text-gray-400'>Content with safe area insets</p>
      </div>
    ),
  },
}

export const WithClassName: Story = {
  args: {
    className: 'px-6',
    children: (
      <div className='flex-1 flex items-center justify-center'>
        <p className='text-gray-400'>Content with horizontal padding</p>
      </div>
    ),
  },
}
