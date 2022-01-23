import React from 'react'

import { Story, Meta } from '@storybook/react'

import { Header, HeaderProps } from '..'

export default {
  title: 'Components/Header',
  component: Header,
} as Meta

const Template: Story<HeaderProps> = args => <Header {...args} />

export const Main = Template.bind({})
Main.args = {
  title: 'Main Story',
}

export const Category = Template.bind({})
Category.args = {
  title: 'Category Story',
}

export const Single = Template.bind({})
Single.args = {
  title: 'Single Story',
}

export const Share = Template.bind({})
Share.args = {
  title: 'Share Story',
}
