// Translates Supabase Auth login error messages to Spanish, mirroring
// ncol-legales' translateAuthError (login context only — ncol-next only
// duplicates the login screen, not registration/reset).
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
