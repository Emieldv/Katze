import { expect, fn, userEvent, within } from 'storybook/test'

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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)

    await step('Remove button fires onRemove with card UID', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Remove' }))
      await expect(args.onRemove).toHaveBeenCalledWith('A1:B2:C3:D4')
    })

    await step('Rename flow updates card name', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Rename' }))
      const input = canvas.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, 'Office card')
      await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
      await expect(args.onRename).toHaveBeenCalledWith('A1:B2:C3:D4', 'Office card')
    })
  },
}

export const RenameWithEnter: Story = {
  args: {
    uid: 'A1:B2:C3:D4',
    name: 'Desk card',
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)

    await step('Enter key submits rename', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Rename' }))
      const input = canvas.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, 'Office card{Enter}')
      await expect(args.onRename).toHaveBeenCalledWith('A1:B2:C3:D4', 'Office card')
    })
  },
}

export const RenameEmptyBlocked: Story = {
  args: {
    uid: 'A1:B2:C3:D4',
    name: 'Desk card',
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)

    await step('Empty name does not fire onRename', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Rename' }))
      const input = canvas.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
      await expect(args.onRename).not.toHaveBeenCalled()
    })
  },
}
