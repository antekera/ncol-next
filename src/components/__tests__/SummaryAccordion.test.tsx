import { render, screen, fireEvent } from '@testing-library/react'
import { SummaryAccordion } from '../SummaryAccordion'
import { GAEvent } from '@lib/utils'
import { GA_EVENTS } from '@lib/constants'

// Mock GAEvent
jest.mock('@lib/utils', () => ({
  GAEvent: jest.fn()
}))

describe('SummaryAccordion', () => {
  const summaryText = 'This is a summary.'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<SummaryAccordion summary={summaryText} />)
    expect(screen.getByText('Ver Resumen')).toBeInTheDocument()
  })

  it('calls GAEvent when opened', () => {
    render(<SummaryAccordion summary={summaryText} />)

    const trigger = screen.getByText('Ver Resumen')
    fireEvent.click(trigger)

    expect(GAEvent).toHaveBeenCalledWith({
      category: GA_EVENTS.AI_SUMMARY.CATEGORY,
      label: GA_EVENTS.AI_SUMMARY.LABEL
    })
  })

  it('displays summary content when opened', () => {
    render(<SummaryAccordion summary={summaryText} />)

    const trigger = screen.getByText('Ver Resumen')
    fireEvent.click(trigger)

    expect(screen.getByText(summaryText)).toBeInTheDocument()
  })
})
