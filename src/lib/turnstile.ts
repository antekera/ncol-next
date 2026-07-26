// Server-side Cloudflare Turnstile verification. The client only proves it
// received a non-empty token from the widget — that token still has to be
// checked against Cloudflare's siteverify endpoint before it's trusted.
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || !token) return false

  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token })
      }
    )
    const data = await res.json()
    return Boolean(data.success)
  } catch {
    return false
  }
}
