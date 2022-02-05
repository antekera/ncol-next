import React from 'react'

import { Story, Meta } from '@storybook/react'

import { Footer, FooterProps } from '..'

export const Default: Story<FooterProps> = args => <Footer {...args} />

export default {
  title: 'Components/Footer',
  component: Footer,
  argTypes: {},
} as Meta
