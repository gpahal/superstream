import type { Meta, StoryObj } from '@storybook/react'

import { DateTimeInput } from '@/components/lib/date-time-input'

const meta: Meta<typeof DateTimeInput> = {
  title: 'DateTimeInput',
  component: DateTimeInput,
  tags: ['autodocs'],
  args: {},
}

export default meta
type Story = StoryObj<typeof DateTimeInput>

export const Default: Story = {
  args: {},
}
