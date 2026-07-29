// Translates Supabase Auth error messages to Spanish, mirroring
// ncol-legales' translateAuthError (login + register contexts).
export function translateLoginError(error: string): string {
  const msg = error.toLowerCase()

  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Demasiadas solicitudes. Por favor, espera un momento antes de volver a intentarlo.'
  }

  if (msg.includes('email not confirmed')) {
    return 'Tu correo electrónico aún no ha sido confirmado. Revisa tu bandeja de entrada.'
  }

  if (msg.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos. Por favor, verifica tus datos.'
  }

  return 'Ocurrió un error al intentar iniciar sesión. Por favor, intenta de nuevo.'
}

export function translateRegisterError(error: string): string {
  const msg = error.toLowerCase()

  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Demasiadas solicitudes. Por favor, espera un momento antes de volver a intentarlo.'
  }

  if (msg.includes('user already registered')) {
    return 'Este correo ya está registrado. Por favor, intenta iniciar sesión.'
  }

  if (msg.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }

  return 'Ocurrió un error al intentar registrar el usuario. Por favor, intenta de nuevo.'
}
