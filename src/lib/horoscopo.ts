// Zodiac sign data with symbols and date ranges
export const ZODIAC_SIGNS = [
  {
    signo: 'aries',
    nombre: 'Aries',
    symbol: '♈',
    fechas: '21 Mar - 19 Abr',
    element: 'fuego',
    color: '#ef4444',
    startMonth: 3,
    startDay: 21,
    endMonth: 4,
    endDay: 19
  },
  {
    signo: 'tauro',
    nombre: 'Tauro',
    symbol: '♉',
    fechas: '20 Abr - 20 May',
    element: 'tierra',
    color: '#22c55e',
    startMonth: 4,
    startDay: 20,
    endMonth: 5,
    endDay: 20
  },
  {
    signo: 'geminis',
    nombre: 'Géminis',
    symbol: '♊',
    fechas: '21 May - 20 Jun',
    element: 'aire',
    color: '#eab308',
    startMonth: 5,
    startDay: 21,
    endMonth: 6,
    endDay: 20
  },
  {
    signo: 'cancer',
    nombre: 'Cáncer',
    symbol: '♋',
    fechas: '21 Jun - 22 Jul',
    element: 'agua',
    color: '#94a3b8',
    startMonth: 6,
    startDay: 21,
    endMonth: 7,
    endDay: 22
  },
  {
    signo: 'leo',
    nombre: 'Leo',
    symbol: '♌',
    fechas: '23 Jul - 22 Ago',
    element: 'fuego',
    color: '#f97316',
    startMonth: 7,
    startDay: 23,
    endMonth: 8,
    endDay: 22
  },
  {
    signo: 'virgo',
    nombre: 'Virgo',
    symbol: '♍',
    fechas: '23 Ago - 22 Sep',
    element: 'tierra',
    color: '#84cc16',
    startMonth: 8,
    startDay: 23,
    endMonth: 9,
    endDay: 22
  },
  {
    signo: 'libra',
    nombre: 'Libra',
    symbol: '♎',
    fechas: '23 Sep - 22 Oct',
    element: 'aire',
    color: '#ec4899',
    startMonth: 9,
    startDay: 23,
    endMonth: 10,
    endDay: 22
  },
  {
    signo: 'escorpio',
    nombre: 'Escorpio',
    symbol: '♏',
    fechas: '23 Oct - 21 Nov',
    element: 'agua',
    color: '#7c3aed',
    startMonth: 10,
    startDay: 23,
    endMonth: 11,
    endDay: 21
  },
  {
    signo: 'sagitario',
    nombre: 'Sagitario',
    symbol: '♐',
    fechas: '22 Nov - 21 Dic',
    element: 'fuego',
    color: '#8b5cf6',
    startMonth: 11,
    startDay: 22,
    endMonth: 12,
    endDay: 21
  },
  {
    signo: 'capricornio',
    nombre: 'Capricornio',
    symbol: '♑',
    fechas: '22 Dic - 19 Ene',
    element: 'tierra',
    color: '#64748b',
    startMonth: 12,
    startDay: 22,
    endMonth: 1,
    endDay: 19
  },
  {
    signo: 'acuario',
    nombre: 'Acuario',
    symbol: '♒',
    fechas: '20 Ene - 18 Feb',
    element: 'aire',
    color: '#06b6d4',
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 18
  },
  {
    signo: 'piscis',
    nombre: 'Piscis',
    symbol: '♓',
    fechas: '19 Feb - 20 Mar',
    element: 'agua',
    color: '#3b82f6',
    startMonth: 2,
    startDay: 19,
    endMonth: 3,
    endDay: 20
  }
] as const

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number]

export function getZodiacSign(signo?: string): ZodiacSign | undefined {
  const slug = signo?.toLowerCase()
  return ZODIAC_SIGNS.find(s => s.signo === slug)
}

export function getCurrentZodiacSign(): ZodiacSign {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  return (
    ZODIAC_SIGNS.find(s => {
      return (
        (month === s.startMonth && day >= s.startDay) ||
        (month === s.endMonth && day <= s.endDay)
      )
    }) || ZODIAC_SIGNS[9]
  )
}

export function getOrderedZodiacSigns(): ZodiacSign[] {
  const current = getCurrentZodiacSign()
  const currentIndex = ZODIAC_SIGNS.findIndex(s => s.signo === current.signo)

  // Reorder: current first, then elements after it, then elements before it
  const after = ZODIAC_SIGNS.slice(currentIndex)
  const before = ZODIAC_SIGNS.slice(0, currentIndex)

  return [...after, ...before]
}

export const HOROSCOPO_KEYWORDS = [
  'horóscopo semanal',
  'horóscopo',
  'predicciones',
  'zodíaco',
  'amor',
  'dinero',
  'bienestar',
  'semanal',
  'venezuela',
  'maracucho'
]

export const HOROSCOPO_SLUG = 'horoscopo'
