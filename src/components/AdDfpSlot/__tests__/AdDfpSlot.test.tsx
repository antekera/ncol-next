import { render } from '@testing-library/react'

import { DFP_ADS } from '@lib/ads'
import { AdsProvider } from '@lib/next-google-dfp-main/src'

import { AdDfpSlot } from '..'

describe('AdDfpSlot', () => {
  test('should match snapshots', () => {
    const { container } = render(
      <AdsProvider ads={DFP_ADS}>
        <AdDfpSlot id='12456789-0' style={{}} />
      </AdsProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
