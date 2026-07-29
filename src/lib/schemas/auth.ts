import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Ingrese un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Ingrese un correo electrónico válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
    terms: z
      .boolean()
      .refine(val => val === true, 'Debe aceptar los términos y condiciones'),
    newsletter: z.boolean().optional()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
