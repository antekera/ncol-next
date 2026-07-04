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
  generatedAt: '2026-07-04T17:55:02.622Z',
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
      name: 'Servicios',
      href: '/etiqueta/servicios/'
    },
    {
      name: 'Actualidad',
      href: '/etiqueta/actualidad/'
    }
  ],
  categoryTags: {
    nacionales: [
      {
        name: 'Política',
        href: '/etiqueta/politica/'
      },
      {
        name: 'Economía',
        href: '/etiqueta/economia/'
      },
      {
        name: 'Servicios',
        href: '/etiqueta/servicios/'
      },
      {
        name: 'Gobierno',
        href: '/etiqueta/gobierno/'
      }
    ],
    sucesos: [
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
      },
      {
        name: 'Torneo',
        href: '/etiqueta/torneo/'
      }
    ],
    internacionales: [
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
