import type { Meta, StoryObj } from '@storybook/react'

import { Badge } from '@/components/lib/badge'

const meta: Meta<typeof Badge> = {
  title: 'Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: 'Badge',
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {},
}

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
  },
}

export const Warn: Story = {
  args: {
    variant: 'warn',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
  },
}
