export type SeoStaticLink = {
  name: string
  href: string
}

export type SeoStaticData = {
  generatedAt: string
  popularTags: SeoStaticLink[]
  nationalTags: SeoStaticLink[]
  categoryTags: Record<string, SeoStaticLink[]>
}

export const seoStaticData: SeoStaticData = {
  "generatedAt": "2026-07-08T19:15:45.355Z",
  "popularTags": [
    {
      "name": "Sistema Patria",
      "href": "/etiqueta/sistema-patria/"
    },
    {
      "name": "Venezuela",
      "href": "/etiqueta/venezuela/"
    },
    {
      "name": "Educación",
      "href": "/etiqueta/educacion/"
    },
    {
      "name": "Bonos",
      "href": "/etiqueta/bonos/"
    },
    {
      "name": "Pensionados",
      "href": "/etiqueta/pensionados/"
    },
    {
      "name": "Economía",
      "href": "/etiqueta/economia/"
    },
    {
      "name": "Delcy Rodríguez",
      "href": "/etiqueta/delcy-rodriguez/"
    },
    {
      "name": "Nacionales",
      "href": "/etiqueta/nacionales/"
    },
    {
      "name": "Cabimas",
      "href": "/etiqueta/cabimas/"
    },
    {
      "name": "Zulia",
      "href": "/etiqueta/zulia/"
    },
    {
      "name": "Administración Pública",
      "href": "/etiqueta/administracion-publica/"
    },
    {
      "name": "Cicpc",
      "href": "/etiqueta/cicpc/"
    },
    {
      "name": "IVSS",
      "href": "/etiqueta/ivss/"
    },
    {
      "name": "Trámites",
      "href": "/etiqueta/tramites/"
    },
    {
      "name": "Infanticidio",
      "href": "/etiqueta/infanticidio/"
    },
    {
      "name": "Estudiantes",
      "href": "/etiqueta/estudiantes/"
    },
    {
      "name": "Accidente Vial",
      "href": "/etiqueta/accidente-vial/"
    },
    {
      "name": "Estados Unidos",
      "href": "/etiqueta/estados-unidos/"
    },
    {
      "name": "Consecomercio",
      "href": "/etiqueta/consecomercio/"
    },
    {
      "name": "Crisis Eléctrica",
      "href": "/etiqueta/crisis-electrica/"
    }
  ],
  "nationalTags": [],
  "categoryTags": {
    "nacionales": [
      {
        "name": "Venezuela",
        "href": "/etiqueta/venezuela/"
      },
      {
        "name": "Terremoto",
        "href": "/etiqueta/terremoto/"
      },
      {
        "name": "Ayuda Humanitaria",
        "href": "/etiqueta/ayuda-humanitaria/"
      },
      {
        "name": "Sismos",
        "href": "/etiqueta/sismos/"
      },
      {
        "name": "Infraestructura",
        "href": "/etiqueta/infraestructura/"
      },
      {
        "name": "Delcy Rodríguez",
        "href": "/etiqueta/delcy-rodriguez/"
      }
    ],
    "sucesos": [
      {
        "name": "Accidente Vial",
        "href": "/etiqueta/accidente-vial/"
      },
      {
        "name": "Abuso Sexual",
        "href": "/etiqueta/abuso-sexual/"
      },
      {
        "name": "Accidente",
        "href": "/etiqueta/accidente/"
      },
      {
        "name": "Terremoto",
        "href": "/etiqueta/terremoto/"
      },
      {
        "name": "Emergencia",
        "href": "/etiqueta/emergencia/"
      },
      {
        "name": "Accidente Aéreo",
        "href": "/etiqueta/accidente-aereo/"
      }
    ],
    "deportes": [
      {
        "name": "Mundial 2026",
        "href": "/etiqueta/mundial-2026/"
      },
      {
        "name": "Copa Mundial",
        "href": "/etiqueta/copa-mundial/"
      },
      {
        "name": "Lionel Messi",
        "href": "/etiqueta/lionel-messi/"
      },
      {
        "name": "Brasil",
        "href": "/etiqueta/brasil/"
      },
      {
        "name": "Argentina",
        "href": "/etiqueta/argentina/"
      },
      {
        "name": "España",
        "href": "/etiqueta/espana/"
      }
    ],
    "futbol": [
      {
        "name": "Mundial 2026",
        "href": "/etiqueta/mundial-2026/"
      },
      {
        "name": "Copa Mundial",
        "href": "/etiqueta/copa-mundial/"
      },
      {
        "name": "Lionel Messi",
        "href": "/etiqueta/lionel-messi/"
      },
      {
        "name": "Brasil",
        "href": "/etiqueta/brasil/"
      },
      {
        "name": "Portugal",
        "href": "/etiqueta/portugal/"
      },
      {
        "name": "Argentina",
        "href": "/etiqueta/argentina/"
      }
    ],
    "beisbol": [
      {
        "name": "Clasico Mundial",
        "href": "/etiqueta/clasico-mundial/"
      },
      {
        "name": "Venezuela",
        "href": "/etiqueta/venezuela/"
      },
      {
        "name": "LVBP",
        "href": "/etiqueta/lvbp/"
      },
      {
        "name": "Grandes Ligas",
        "href": "/etiqueta/grandes-ligas/"
      },
      {
        "name": "Béisbol",
        "href": "/etiqueta/beisbol/"
      },
      {
        "name": "Tigres de Aragua",
        "href": "/etiqueta/tigres-de-aragua/"
      }
    ],
    "internacionales": [
      {
        "name": "Estados Unidos",
        "href": "/etiqueta/estados-unidos/"
      },
      {
        "name": "Ayuda Humanitaria",
        "href": "/etiqueta/ayuda-humanitaria/"
      },
      {
        "name": "Terremoto",
        "href": "/etiqueta/terremoto/"
      },
      {
        "name": "Elecciones",
        "href": "/etiqueta/elecciones/"
      },
      {
        "name": "Marco Rubio",
        "href": "/etiqueta/marco-rubio/"
      },
      {
        "name": "Colombia",
        "href": "/etiqueta/colombia/"
      }
    ],
    "entretenimiento": [
      {
        "name": "Shakira",
        "href": "/etiqueta/shakira/"
      },
      {
        "name": "Karol G",
        "href": "/etiqueta/karol-g/"
      },
      {
        "name": "Música",
        "href": "/etiqueta/musica/"
      },
      {
        "name": "Jennifer López",
        "href": "/etiqueta/jennifer-lopez/"
      },
      {
        "name": "Venezuela",
        "href": "/etiqueta/venezuela/"
      },
      {
        "name": "Moda",
        "href": "/etiqueta/moda/"
      }
    ],
    "farandula": [
      {
        "name": "Shakira",
        "href": "/etiqueta/shakira/"
      },
      {
        "name": "Karol G",
        "href": "/etiqueta/karol-g/"
      },
      {
        "name": "Jennifer López",
        "href": "/etiqueta/jennifer-lopez/"
      },
      {
        "name": "Música",
        "href": "/etiqueta/musica/"
      },
      {
        "name": "Moda",
        "href": "/etiqueta/moda/"
      },
      {
        "name": "Miami",
        "href": "/etiqueta/miami/"
      }
    ],
    "tendencias": [
      {
        "name": "Nutrición",
        "href": "/etiqueta/nutricion/"
      },
      {
        "name": "Salud",
        "href": "/etiqueta/salud/"
      },
      {
        "name": "Educación",
        "href": "/etiqueta/educacion/"
      },
      {
        "name": "Sistema Patria",
        "href": "/etiqueta/sistema-patria/"
      },
      {
        "name": "Remedios naturales",
        "href": "/etiqueta/remedios-naturales/"
      },
      {
        "name": "Remedios caseros",
        "href": "/etiqueta/remedios-caseros/"
      }
    ],
    "ciencia-y-tecnologia": [
      {
        "name": "Inteligencia Artificial",
        "href": "/etiqueta/inteligencia-artificial/"
      },
      {
        "name": "NASA",
        "href": "/etiqueta/nasa/"
      },
      {
        "name": "Apple",
        "href": "/etiqueta/apple/"
      },
      {
        "name": "Exploración espacial",
        "href": "/etiqueta/exploracion-espacial/"
      },
      {
        "name": "Educación",
        "href": "/etiqueta/educacion/"
      },
      {
        "name": "Robótica",
        "href": "/etiqueta/robotica/"
      }
    ],
    "zulia": [
      {
        "name": "Zulia",
        "href": "/etiqueta/zulia/"
      },
      {
        "name": "Cabimas",
        "href": "/etiqueta/cabimas/"
      },
      {
        "name": "Maracaibo",
        "href": "/etiqueta/maracaibo/"
      },
      {
        "name": "Infraestructura",
        "href": "/etiqueta/infraestructura/"
      },
      {
        "name": "Salud",
        "href": "/etiqueta/salud/"
      }
    ],
    "costa-oriental": [
      {
        "name": "Cabimas",
        "href": "/etiqueta/cabimas/"
      },
      {
        "name": "Zulia",
        "href": "/etiqueta/zulia/"
      },
      {
        "name": "CAICOC",
        "href": "/etiqueta/caicoc/"
      },
      {
        "name": "Salud",
        "href": "/etiqueta/salud/"
      },
      {
        "name": "Escuelas",
        "href": "/etiqueta/escuelas/"
      }
    ],
    "cabimas": [
      {
        "name": "Cabimas",
        "href": "/etiqueta/cabimas/"
      },
      {
        "name": "Zulia",
        "href": "/etiqueta/zulia/"
      },
      {
        "name": "CAICOC",
        "href": "/etiqueta/caicoc/"
      },
      {
        "name": "Salud",
        "href": "/etiqueta/salud/"
      },
      {
        "name": "Escuelas",
        "href": "/etiqueta/escuelas/"
      }
    ],
    "maracaibo": [
      {
        "name": "Maracaibo",
        "href": "/etiqueta/maracaibo/"
      },
      {
        "name": "Zulia",
        "href": "/etiqueta/zulia/"
      },
      {
        "name": "Canasta Básica",
        "href": "/etiqueta/canasta-basica/"
      },
      {
        "name": "Inflación",
        "href": "/etiqueta/inflacion/"
      },
      {
        "name": "Infraestructura",
        "href": "/etiqueta/infraestructura/"
      }
    ],
    "politica": [
      {
        "name": "Venezuela",
        "href": "/etiqueta/venezuela/"
      },
      {
        "name": "Elecciones",
        "href": "/etiqueta/elecciones/"
      },
      {
        "name": "Delcy Rodríguez",
        "href": "/etiqueta/delcy-rodriguez/"
      },
      {
        "name": "Diplomacia",
        "href": "/etiqueta/diplomacia/"
      },
      {
        "name": "Economía",
        "href": "/etiqueta/economia/"
      },
      {
        "name": "Asamblea Nacional",
        "href": "/etiqueta/asamblea-nacional/"
      }
    ]
  }
} as const
