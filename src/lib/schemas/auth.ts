import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Ingrese un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

export type LoginFormValues = z.infer<typeof loginSchema>
