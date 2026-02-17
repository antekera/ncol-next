import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DenunciaForm from '../DenunciaForm'
import '@testing-library/jest-dom'
import { submitDenuncia } from '../../app/actions/submit-denuncia'
import { toast } from 'sonner'

// Mock the server action
jest.mock('../../app/actions/submit-denuncia', () => ({
  submitDenuncia: jest.fn()
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}))

// Mock Turnstile
const mockGetResponse = jest.fn()
const mockReset = jest.fn()
const mockRender = jest.fn()

describe('DenunciaForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.turnstile = {
      getResponse: mockGetResponse,
      reset: mockReset,
      render: mockRender
    }
  })

  it('renders the form correctly', () => {
    render(<DenunciaForm />)
    expect(screen.getByLabelText(/¿Qué está pasando?/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Municipio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Parroquia/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sector\/Referencia/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Descripción de los hechos/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/WhatsApp/i)).toBeInTheDocument()
  })

  it('submits correctly with required fields', async () => {
    ;(submitDenuncia as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Success'
    })
    mockGetResponse.mockReturnValue('fake-token')

    render(<DenunciaForm />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/¿Qué está pasando?/i), {
      target: { value: 'Test Title' }
    })
    fireEvent.change(screen.getByLabelText(/Estado/i), {
      target: { value: 'Zulia' }
    })
    fireEvent.change(screen.getByLabelText(/Municipio/i), {
      target: { value: 'Cabimas' }
    })
    fireEvent.change(screen.getByLabelText(/Parroquia/i), {
      target: { value: 'La Rosa' }
    })
    fireEvent.change(screen.getByLabelText(/Sector\/Referencia/i), {
      target: { value: 'Test Sector' }
    })
    fireEvent.change(screen.getByLabelText(/Descripción de los hechos/i), {
      target: { value: 'Test Description' }
    })
    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), {
      target: { value: '1234567' }
    })

    const submitButton = screen.getByRole('button', {
      name: /Enviar Denuncia/i
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitDenuncia).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Success')
    })
  })

  it('shows error if server action fails', async () => {
    ;(submitDenuncia as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Error Message'
    })
    mockGetResponse.mockReturnValue('fake-token')

    render(<DenunciaForm />)

    fireEvent.change(screen.getByLabelText(/¿Qué está pasando?/i), {
      target: { value: 'Test Title' }
    })
    // ... fill other required fields
    fireEvent.change(screen.getByLabelText(/Estado/i), {
      target: { value: 'Zulia' }
    })
    fireEvent.change(screen.getByLabelText(/Municipio/i), {
      target: { value: 'Cabimas' }
    })
    fireEvent.change(screen.getByLabelText(/Parroquia/i), {
      target: { value: 'La Rosa' }
    })
    fireEvent.change(screen.getByLabelText(/Sector\/Referencia/i), {
      target: { value: 'Test Sector' }
    })
    fireEvent.change(screen.getByLabelText(/Descripción de los hechos/i), {
      target: { value: 'Test Description' }
    })
    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), {
      target: { value: '1234567' }
    })

    fireEvent.click(screen.getByRole('button', { name: /Enviar Denuncia/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error Message')
    })
  })

  it('toggles anonymity checkbox correctly', () => {
    render(<DenunciaForm />)
    const checkbox = screen.getByLabelText(/Quiero que mi nombre/i)
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('validates required fields locally (implicitly by not calling action if empty)', async () => {
    render(<DenunciaForm />)
    fireEvent.click(screen.getByRole('button', { name: /Enviar Denuncia/i }))
    // Since we are not actually submitting to server without filling fields
    expect(submitDenuncia).not.toHaveBeenCalled()
  })
})
