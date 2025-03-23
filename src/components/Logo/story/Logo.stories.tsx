import { Meta, StoryFn } from '@storybook/react'
import { Logo, LogoProps, LogoType } from '../index'

export default {
  title: 'Components/Logo',
  component: Logo,
  argTypes: {
    type: {
      defaultValue: 'logoname',
      control: {
        type: 'inline-radio',
        options: ['logocomb', 'logocomb', 'logoname', 'logonameb', 'logosquare']
      }
    },
    width: {
      defaultValue: 200,
      control: {
        type: 'number'
      }
    },
    height: {
      defaultValue: 80,
      control: {
        type: 'number'
      }
    }
  }
} as Meta

const Template: StoryFn<LogoProps> = args => <Logo {...args} />

export const Default = Template.bind({})
Default.args = {
  type: LogoType.logocom
}
