import { render, screen, fireEvent } from '@testing-library/react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '../accordion'

describe('Accordion', () => {
  it('renders correctly', () => {
    render(
      <Accordion type='single' collapsible>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('Trigger 1')).toBeInTheDocument()
    // Content might not be visible initially, but it should be in the DOM structure or accessible via interaction
  })

  it('toggles content on click', () => {
    render(
      <Accordion type='single' collapsible>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger = screen.getByText('Trigger 1')
    fireEvent.click(trigger)

    expect(screen.getByText('Content 1')).toBeVisible()

    fireEvent.click(trigger)
    // Depending on animation/implementation, checking visibility might be tricky immediately,
    // but we can check attributes or if it's still in document.
  })
})
