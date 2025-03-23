import { Meta, StoryFn } from '@storybook/react'
import { Footer } from '..'

export const Default: StoryFn = args => <Footer {...args} />

export default {
  title: 'Components/Footer',
  component: Footer,
  argTypes: {}
} as Meta
