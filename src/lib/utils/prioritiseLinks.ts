import { SERVICES_MENU } from '@lib/constants'

export function prioritiseLinks(now = new Date()) {
  const bogota = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Caracas' })
  )
  const day = bogota.getDay() // 0=Sun … 6=Sat
  const hour = bogota.getHours()
  const links = [...SERVICES_MENU]

  let priorityName: string | null = null
  if (day === 0) {
    priorityName = 'Horóscopo'
  } else if (day >= 1 && day <= 5 && hour < 12) {
    priorityName = 'Calculadora Dólar'
  }

  if (priorityName) {
    const idx = links.findIndex(l => l.name === priorityName)
    if (idx > 0) links.unshift(links.splice(idx, 1)[0])
  }

  return links
}
