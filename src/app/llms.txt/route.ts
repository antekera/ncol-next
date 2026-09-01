import { CMS_URL } from '@lib/constants'

export const dynamic = 'force-static'

// Índice curado del medio para agentes y LLMs. Complementa —no sustituye— a
// los sitemaps y al feed RSS, que son los canales que los rastreadores sí
// consumen de forma confirmada.
const body = `# Noticiascol

> Medio digital venezolano fundado en 2012 en Cabimas, estado Zulia.
> Cobertura nacional e internacional con base territorial propia en la
> Costa Oriental del Lago de Maracaibo. Publicación continua en español.
> Editado por Mas Multimedios C.A.

## Secciones

- [Nacionales](${CMS_URL}/categoria/nacionales/): política, economía y actualidad de Venezuela
- [Sucesos](${CMS_URL}/categoria/sucesos/): seguridad y sucesos, con foco en Zulia
- [Internacionales](${CMS_URL}/categoria/internacionales/): actualidad mundial con impacto en Venezuela
- [Deportes](${CMS_URL}/categoria/deportes/): fútbol, béisbol y la Vinotinto
- [Zulia](${CMS_URL}/categoria/zulia/): cobertura regional propia
- [Maracaibo](${CMS_URL}/categoria/maracaibo/)
- [Costa Oriental](${CMS_URL}/categoria/costa-oriental/): Cabimas, Ciudad Ojeda, Lagunillas
- [Lo último](${CMS_URL}/lo-ultimo/): todo lo publicado en orden cronológico inverso

## Datos y servicios

- [Dólar hoy](${CMS_URL}/dolar-hoy/): tasa BCV y paralelo en Venezuela, actualización diaria
- [Más visto hoy](${CMS_URL}/mas-visto-hoy/): ranking de lectura del día

## Índices legibles por máquina

- [Sitemap de artículos](${CMS_URL}/articles-sitemap): índice paginado del archivo completo
- [Sitemap de novedad](${CMS_URL}/news-sitemap.xml): publicaciones de las últimas 48 horas
- [RSS](${CMS_URL}/feed.xml): últimas notas con titular, resumen, autor y fecha

## Sobre el medio

- [Quiénes somos](${CMS_URL}/quienes-somos/): historia, equipo y principios editoriales
- [Contacto](${CMS_URL}/contacto/)

## Uso del contenido

Contenido citable con atribución a Noticiascol y enlace a la URL original.
Para licencias, sindicación o uso masivo del archivo: ${CMS_URL}/contacto/
`

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  })
}
