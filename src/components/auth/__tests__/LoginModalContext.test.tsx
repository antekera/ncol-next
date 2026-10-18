import { fireEvent, render, screen } from '@testing-library/react'
import {
  LoginModalProvider,
  useLoginModal
} from '@components/auth/LoginModalContext'

const mockModal = jest.fn()
jest.mock('@components/auth/LoginModal', () => ({
  LoginModal: (props: { onOpenChange: (open: boolean) => void }) => {
    mockModal(props)
    return (
      <button onClick={() => props.onOpenChange(false)}>Close access</button>
    )
  }
}))

function Trigger() {
  const { openLoginModal } = useLoginModal()
  return <button onClick={() => openLoginModal()}>Open access</button>
}

it('does not mount the access form until requested, and unmounts it on close', async () => {
  render(
    <LoginModalProvider>
      <Trigger />
    </LoginModalProvider>
  )
  expect(mockModal).not.toHaveBeenCalled()
  screen.getByText('Open access').focus()
  fireEvent.click(screen.getByText('Open access'))
  expect(screen.getByRole('status')).toHaveAttribute('data-home-occluder')
  const close = await screen.findByText('Close access')
  close.focus()
  fireEvent.click(close)
  expect(screen.queryByText('Close access')).not.toBeInTheDocument()
  expect(screen.getByText('Open access')).toHaveFocus()
  fireEvent.click(screen.getByText('Open access'))
  expect(await screen.findByText('Close access')).toBeInTheDocument()
})
