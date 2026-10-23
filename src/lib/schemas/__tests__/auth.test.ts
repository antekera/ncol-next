import { loginSchema, registerSchema } from '../auth'

const credential = 'test-password'
const registration = {
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'reader@example.com',
  password: credential,
  confirmPassword: credential,
  terms: true,
  newsletter: false
}

describe('authentication validation with Zod 4', () => {
  test.each([
    'reader@example.com',
    'reader+noticias@example.com',
    'reader.name@news.example.com'
  ])('accepts %s for login and registration', email => {
    expect(loginSchema.safeParse({ ...registration, email }).success).toBe(true)
    expect(registerSchema.safeParse({ ...registration, email }).success).toBe(
      true
    )
  })

  test.each(['', 'reader', 'reader@', 'reader@example', 'a..b@example.com'])(
    'keeps the Spanish email error for %s',
    email => {
      for (const schema of [loginSchema, registerSchema]) {
        const result = schema.safeParse({ ...registration, email })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues).toContainEqual(
            expect.objectContaining({
              path: ['email'],
              message: 'Ingrese un correo electrónico válido'
            })
          )
        }
      }
    }
  )

  test.each<[keyof typeof registration, string | boolean, string]>([
    ['password', '', 'La contraseña debe tener al menos 8 caracteres'],
    ['confirmPassword', 'different', 'Las contraseñas no coinciden'],
    ['terms', false, 'Debe aceptar los términos y condiciones']
  ])('retains the registration constraint on %s', (field, value, message) => {
    const result = registerSchema.safeParse({
      ...registration,
      [field]: value
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: [field], message })
      )
    }
  })
})
