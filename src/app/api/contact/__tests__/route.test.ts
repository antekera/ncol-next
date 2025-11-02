jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data
    })
  }
}))

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: jest.fn().mockResolvedValue({}) }
  }))
}))

jest.mock('@lib/utils', () => ({
  isProd: false
}))

// Import after mocks using dynamic import to satisfy lint rules
let POST: any
beforeAll(async () => {
  ;({ POST } = await import('../route'))
})

describe('contact route POST', () => {
  it('returns 400 for missing fields', async () => {
    const req: any = { json: async () => ({}) }
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toEqual({ message: 'Faltan datos.' })
  })

  it('returns 200 on success', async () => {
    const req: any = {
      json: async () => ({
        name: 'Alice',
        email: 'a@b.com',
        subject: 'otro',
        message: 'hola'
      })
    }
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ message: 'Mensaje enviado exitosamente.' })
  })

  const importRouteWithFailingResend = async () => {
    jest.resetModules()
    jest.doMock('resend', () => ({
      Resend: jest.fn().mockImplementation(() => ({
        emails: { send: jest.fn().mockRejectedValue(new Error('boom')) }
      }))
    }))
    jest.doMock('@lib/utils', () => ({ isProd: false }))
    const mod = await import('../route')
    return mod.POST
  }

  it('returns 500 when provider throws', async () => {
    const POSTFail = await importRouteWithFailingResend()
    const req: any = {
      json: async () => ({
        name: 'Bob',
        email: 'b@c.com',
        subject: 'otro',
        message: 'hola'
      })
    }
    const res = await POSTFail(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json).toEqual({ message: 'Error al enviar correo.' })
  })

  const importRouteWithProdAndCaptcha = async (captchaSuccess: boolean) => {
    jest.resetModules()
    jest.doMock('@lib/utils', () => ({ isProd: true }))
    jest.doMock('resend', () => ({
      Resend: jest.fn().mockImplementation(() => ({
        emails: { send: jest.fn().mockResolvedValue({}) }
      }))
    }))
    // Mock captcha verification response
    ;(global as any).fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: captchaSuccess })
    })
    const mod = await import('../route')
    return mod.POST
  }

  it('returns 403 when captcha fails in production', async () => {
    const POSTProd = await importRouteWithProdAndCaptcha(false)
    const req: any = {
      json: async () => ({
        name: 'Alice',
        email: 'a@b.com',
        subject: 'otro',
        message: 'hola',
        token: 'bad'
      })
    }
    const res = await POSTProd(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json).toEqual({ message: 'Error de validación humana.' })
  })

  it('returns 200 when captcha passes in production', async () => {
    const POSTProd = await importRouteWithProdAndCaptcha(true)
    const req: any = {
      json: async () => ({
        name: 'Alice',
        email: 'a@b.com',
        subject: 'notas-de-prensa',
        message: 'hola',
        token: 'ok'
      })
    }
    const res = await POSTProd(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ message: 'Mensaje enviado exitosamente.' })
  })
})
