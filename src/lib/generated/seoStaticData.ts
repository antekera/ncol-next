export type SeoStaticLink = {
  name: string
  href: string
}

export type SeoStaticData = {
  generatedAt: string
  nationalTags: SeoStaticLink[]
  categoryTags: Record<string, SeoStaticLink[]>
}

export const seoStaticData: SeoStaticData = {
  generatedAt: '2026-07-04T22:05:00.000Z',
  nationalTags: [
    {
      name: 'Venezuela',
      href: '/etiqueta/venezuela/'
    },
    {
      name: 'Política',
      href: '/etiqueta/politica/'
    },
    {
      name: 'Economía',
      href: '/etiqueta/economia/'
    },
    {
      name: 'Sucesos',
      href: '/etiqueta/sucesos/'
    },
    {
      name: 'Deportes',
      href: '/etiqueta/deportes/'
    },
    {
      name: 'Internacionales',
      href: '/etiqueta/internacionales/'
    },
    {
      name: 'Gobierno',
      href: '/etiqueta/gobierno/'
    },
    {
      name: 'Actualidad',
      href: '/etiqueta/actualidad/'
    },
    {
      name: 'Policía',
      href: '/etiqueta/policia/'
    },
    {
      name: 'Accidentes',
      href: '/etiqueta/accidentes/'
    },
    {
      name: 'Fútbol',
      href: '/etiqueta/futbol/'
    },
    {
      name: 'Béisbol',
      href: '/etiqueta/beisbol/'
    }
  ],
  categoryTags: {
    nacionales: [
      {
        name: 'Venezuela',
        href: '/etiqueta/venezuela/'
      },
      {
        name: 'Política',
        href: '/etiqueta/politica/'
      },
      {
        name: 'Economía',
        href: '/etiqueta/economia/'
      },
      {
        name: 'Gobierno',
        href: '/etiqueta/gobierno/'
      },
      {
        name: 'Actualidad',
        href: '/etiqueta/actualidad/'
      }
    ],
    sucesos: [
      {
        name: 'Sucesos',
        href: '/etiqueta/sucesos/'
      },
      {
        name: 'Policía',
        href: '/etiqueta/policia/'
      },
      {
        name: 'Accidentes',
        href: '/etiqueta/accidentes/'
      },
      {
        name: 'Tribunales',
        href: '/etiqueta/tribunales/'
      },
      {
        name: 'Seguridad',
        href: '/etiqueta/seguridad/'
      }
    ],
    deportes: [
      {
        name: 'Deportes',
        href: '/etiqueta/deportes/'
      },
      {
        name: 'Fútbol',
        href: '/etiqueta/futbol/'
      },
      {
        name: 'Béisbol',
        href: '/etiqueta/beisbol/'
      },
      {
        name: 'Vinotinto',
        href: '/etiqueta/vinotinto/'
      }
    ],
    internacionales: [
      {
        name: 'Internacionales',
        href: '/etiqueta/internacionales/'
      },
      {
        name: 'Latinoamérica',
        href: '/etiqueta/latinoamerica/'
      },
      {
        name: 'EEUU',
        href: '/etiqueta/eeuu/'
      },
      {
        name: 'Migración',
        href: '/etiqueta/migracion/'
      },
      {
        name: 'Geopolítica',
        href: '/etiqueta/geopolitica/'
      }
    ]
  }
} as const
