import React from 'react'

import { Story, Meta } from '@storybook/react'

import { Footer } from '..'

export const Default: Story = args => <Footer {...args} />

export default {
  title: 'Components/Footer',
  component: Footer,
  argTypes: {},
} as Meta
