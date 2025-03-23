import { Meta, StoryFn } from '@storybook/react'
import { Header, HeaderProps, HeaderType } from '..'

export const Default: StoryFn<HeaderProps> = args => <Header {...args} />

export default {
  title: 'Components/Header',
  component: Header,
  argTypes: {
    title: {
      defaultValue: ''
    },
    type: {
      defaultValue: HeaderType.Main,
      control: {
        type: 'select',
        options: [
          HeaderType.Main,
          HeaderType.Category,
          HeaderType.Single,
          HeaderType.Share,
          HeaderType.Primary
        ]
      }
    },
    compact: {
      defaultValue: false,
      control: {
        type: 'boolean'
      }
    },
    className: {
      defaultValue: ''
    },
    isMobile: {
      defaultValue: false,
      control: {
        type: 'boolean'
      }
    }
  }
} as Meta
