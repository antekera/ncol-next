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

// Mock URL methods (not available in JSDOM)
if (typeof window !== 'undefined') {
  global.URL.createObjectURL = jest.fn(() => 'test-url')
  global.URL.revokeObjectURL = jest.fn()
}

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
      screen.getByLabelText(/1\. ¿Qué ocurrió exactamente\?/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/2\. ¿Quiénes son los afectados o responsables\?/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/3\. ¿Desde cuándo ocurre esto o cuándo pasó\?/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(
        /4\. ¿Se ha hecho alguna denuncia previa a las autoridades\?/i
      )
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(
        /5\. ¿Qué solución espera o qué pide a las autoridades\?/i
      )
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/WhatsApp/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument()
  })

  it('submits correctly with required fields and media', async () => {
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
    fireEvent.change(screen.getByLabelText(/1\. ¿Qué ocurrió exactamente\?/i), {
      target: { value: 'Test Details' }
    })
    fireEvent.change(
      screen.getByLabelText(/2\. ¿Quiénes son los afectados o responsables\?/i),
      {
        target: { value: 'Test Involved' }
      }
    )
    fireEvent.change(
      screen.getByLabelText(/3\. ¿Desde cuándo ocurre esto o cuándo pasó\?/i),
      {
        target: { value: 'Test Time' }
      }
    )
    fireEvent.change(
      screen.getByLabelText(
        /4\. ¿Se ha hecho alguna denuncia previa a las autoridades\?/i
      ),
      {
        target: { value: 'No' }
      }
    )
    fireEvent.change(
      screen.getByLabelText(
        /5\. ¿Qué solución espera o qué pide a las autoridades\?/i
      ),
      {
        target: { value: 'Test Solution' }
      }
    )
    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), {
      target: { value: '1234567' }
    })

    // Simulate file upload
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
    const input = document.getElementById('media-upload') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

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
    fireEvent.change(screen.getByLabelText(/1\. ¿Qué ocurrió exactamente\?/i), {
      target: { value: 'Test Details' }
    })
    fireEvent.change(
      screen.getByLabelText(/2\. ¿Quiénes son los afectados o responsables\?/i),
      {
        target: { value: 'Test Involved' }
      }
    )
    fireEvent.change(
      screen.getByLabelText(/3\. ¿Desde cuándo ocurre esto o cuándo pasó\?/i),
      {
        target: { value: 'Test Time' }
      }
    )
    fireEvent.change(
      screen.getByLabelText(
        /4\. ¿Se ha hecho alguna denuncia previa a las autoridades\?/i
      ),
      {
        target: { value: 'No' }
      }
    )
    fireEvent.change(
      screen.getByLabelText(
        /5\. ¿Qué solución espera o qué pide a las autoridades\?/i
      ),
      {
        target: { value: 'Test Solution' }
      }
    )
    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), {
      target: { value: '1234567' }
    })

    // Simulate file upload
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })
    const input = document.getElementById('media-upload') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

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

  it('allows removing an uploaded file', async () => {
    render(<DenunciaForm />)
    const file = new File(['foo'], 'foo.png', { type: 'image/png' })
    const input = document.getElementById('media-upload') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByAltText('preview')).toBeInTheDocument()

    const removeButton = screen.getByRole('button', { name: '' }) // The X icon button
    fireEvent.click(removeButton)

    expect(screen.queryByAltText('preview')).not.toBeInTheDocument()
  })

  it('shows video filename for video uploads', async () => {
    render(<DenunciaForm />)
    const file = new File(['video'], 'video.mp4', { type: 'video/mp4' })
    const input = document.getElementById('media-upload') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('video.mp4')).toBeInTheDocument()
  })

  it('validates media requirement locally', async () => {
    render(<DenunciaForm />)

    // Fill all text fields but no media
    fireEvent.change(screen.getByLabelText(/¿Qué está pasando?/i), {
      target: { value: 'Title' }
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
      target: { value: 'Sector' }
    })
    fireEvent.change(screen.getByLabelText(/1\. ¿Qué ocurrió exactamente\?/i), {
      target: { value: 'Details' }
    })
    fireEvent.change(
      screen.getByLabelText(/2\. ¿Quiénes son los afectados o responsables\?/i),
      { target: { value: 'Involved' } }
    )
    fireEvent.change(
      screen.getByLabelText(/3\. ¿Desde cuándo ocurre esto o cuándo pasó\?/i),
      { target: { value: 'Time' } }
    )
    fireEvent.change(
      screen.getByLabelText(
        /4\. ¿Se ha hecho alguna denuncia previa a las autoridades\?/i
      ),
      { target: { value: 'Actions' } }
    )
    fireEvent.change(
      screen.getByLabelText(
        /5\. ¿Qué solución espera o qué pide a las autoridades\?/i
      ),
      { target: { value: 'Solution' } }
    )
    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), {
      target: { value: 'Name' }
    })
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), {
      target: { value: '123' }
    })

    fireEvent.click(screen.getByRole('button', { name: /Enviar Denuncia/i }))

    expect(toast.error).toHaveBeenCalledWith(
      'Debes subir al menos una foto o un video de la denuncia.'
    )
    expect(submitDenuncia).not.toHaveBeenCalled()
  })
})
