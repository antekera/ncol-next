// @ts-nocheck
import React from 'react'

import { render, fireEvent, screen } from '@testing-library/react'

import { Share } from '..'

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null)
    }
  }
}))

describe('Share', () => {
  beforeEach(() => {
    window.dataLayer = []
  })

  test('it should render without errors', () => {
    const { container } = render(<Share />)
    expect(container.firstChild).toBeInTheDocument()
  })

  test('it should call the GAEvent function when clicking on the Facebook, Twitter, and WhatsApp links', () => {
    render(<Share />)

    fireEvent.click(screen.getByTitle('Compartir por WhatsApp'))
    expect(window.dataLayer).toMatchObject([
      {
        category: 'SHARE_OPTION',
        event: 'CLICK_EVENT',
        label: 'WHATSAPP',
        non_interaction: false
      }
    ])
  })
})
