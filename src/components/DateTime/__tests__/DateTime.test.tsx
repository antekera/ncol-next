import React from 'react'

import { render } from '@testing-library/react'

import { usePageStore } from '@lib/hooks/store'

import { DateTime } from '..'

describe('DateTime', () => {
  beforeEach(() => {
    usePageStore.setState({
      today: new Date('2000-01-01T00:00:00.000Z')
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  usePageStore.setState({ today: Date.prototype })

  test('should display store date if dateString is undefined', () => {
    const { container } = render(<DateTime />)

    expect(container.firstChild).toContainHTML('diciembre 31, 1999')
    expect(container.firstChild).toContainHTML('09:00 p.m.')
  })

  test('should display formal date', () => {
    const { container } = render(<DateTime formal />)

    expect(container.firstChild).toContainHTML('31 de diciembre de 1999')
  })

  test('should display string date', () => {
    const { container } = render(
      <DateTime dateString={'2001-01-01T00:00:00.000Z'} />
    )

    expect(container.firstChild).toContainHTML('diciembre 31, 2000')
  })
})
