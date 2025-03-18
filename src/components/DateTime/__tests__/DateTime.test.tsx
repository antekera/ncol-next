import '@testing-library/jest-dom'

import { render } from '@testing-library/react'

import { StateContextProvider } from '@lib/context/StateContext'

import { DateTime } from '..'

// TODO: Skipping tests temporarily
describe.skip('DateTime', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2000-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should display store date if dateString is undefined', () => {
    const { container } = render(
      <StateContextProvider>
        <DateTime />
      </StateContextProvider>
    )

    expect(container.firstChild).toContainHTML(
      '<span class="capitalize">diciembre 31, 1999</span>'
    )
    expect(container.firstChild).toContainHTML(
      '<time><span class="capitalize">diciembre 31, 1999</span><span> • 09:00 p.m.</span></time>'
    )
  })

  test('should display formal date', () => {
    const { container } = render(
      <StateContextProvider>
        <DateTime formal />
      </StateContextProvider>
    )

    expect(container.firstChild).toContainHTML('31 de diciembre de 1999')
  })

  test('should display string date', () => {
    const { container } = render(
      <StateContextProvider>
        <DateTime dateString={'2001-01-01T00:00:00.000Z'} />
      </StateContextProvider>
    )

    expect(container.firstChild).toContainHTML('diciembre 31, 2000')
  })

  test('should return null if date is empty', () => {
    const { container } = render(
      <StateContextProvider>
        <DateTime dateString={''} />
      </StateContextProvider>
    )

    expect(container.firstChild).toBeNull()
  })
})
