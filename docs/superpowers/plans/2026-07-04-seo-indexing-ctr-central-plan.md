# SEO, Indexing y CTR Interno - Plan Centralizado

**Proyecto:** `ncol-next`
**Fecha:** 2026-07-04
**Objetivo:** Mejorar `indexing`, `CTR interno` y la percepción de marca de `Noticiascol` como medio de noticias de Venezuela, manteniendo la cobertura regional como soporte editorial.

## 1. Contexto

El sitio ya tiene una base SEO sólida:

- [x] metadata global
- [x] canonical en categorías y artículos
- [x] JSON-LD de `NewsMediaOrganization`, `WebSite`, `NewsArticle` y `BreadcrumbList`
- [x] sitemap para páginas principales y artículos
- [x] rutas indexables para categorías, tags, temas de servicio y notas individuales

El problema actual no es la ausencia de SEO básico, sino la priorización editorial y la distribución interna de autoridad:

- [x] demasiada dependencia de cobertura regional como mensaje principal
- [x] módulos de navegación internos que pueden concentrarse mejor
- [x] oportunidades para mover enlaces estratégicos a HTML estático o SSR
- [x] reducir señales hacia URLs indexables de bajo valor

## 2. Señales observadas en Analytics y Search Console

### 2.1 Search Console

- [x] `604K` impresiones
- [x] `36.8K` clics
- [x] `CTR 6.1%`
- [x] posición media `7.5`

Esto indica que el sitio ya compite bien en resultados, pero aún tiene margen para mejorar CTR con mejores titles, descriptions y jerarquía de contenido.

### 2.2 Indexación

- [x] `13.9K` páginas indexadas
- [x] `38.3K` páginas no indexadas

Hay mucha cola de URLs. Eso no es necesariamente malo, pero sí sugiere que conviene reforzar canónicas, sitemap, hubs y enlaces internos para concentrar señales en las URLs que sí importan.

### 2.3 Engagement interno

Se observan eventos relevantes en:

- [x] `LINK_SINGLE`
- [x] `MOST_VISITED`
- [x] `SECONDARY`
- [x] `TODAY_NEWS_CARD`
- [x] `THUMBNAIL`
- [x] `LIST`
- [x] `OPEN_MENU`
- [x] `OPEN_ACCORDION`
- [x] `CLICK_VER_NOTICIAS`
- [x] `LINK_COVER`
- [x] `RECENT_NEWS`

Conclusión: el usuario sí navega por módulos internos. El trabajo debe ser hacer esos módulos más útiles para SEO y más visibles para navegación.

## 3. Decisión editorial

La dirección deseada es:

- [x] `Noticiascol` como medio de noticias de Venezuela primero
- [x] lo regional como capa secundaria y de profundidad
- [x] las categorías madre como hubs de navegación y descubrimiento

Esto implica:

- [x] subir el peso de `Venezuela`, `Nacionales`, `Internacionales`, `Sucesos`, `Deportes`, `Economía`
- [x] mantener `Zulia`, `Cabimas`, `Maracaibo`, `Ciudad Ojeda`, `Costa Oriental` como clusters fuertes, pero no como único foco de marca

## 4. Principios de implementación

1. Todo lo que sea navegación estratégica debe estar disponible en HTML inicial o precomputado.
2. Todo lo que no cambie por request debe ser estático.
3. Todo lo que ayude a descubrir contenido debe minimizar costo de backend.
4. El home debe simplificarse para empujar el recorrido editorial principal.
5. Las categorías madre deben funcionar como hubs semánticos.

## 5. Propuesta de arquitectura

### 5.1 Home

El home se va a rediseñar para:

- [x] simplificar navegación principal a 3 accesos
- [x] dar más protagonismo a noticias nacionales
- [x] mantener módulos de utilidad, pero sin que dominen la jerarquía

Propuesta de accesos principales:

- [x] `Más vistos`
- [x] `Más leídos`
- [x] `Por fecha`

### 5.2 Header y menú principal

El menú del home se reducirá a 3 botones visibles de alto valor.

Sugerencia:

- [x] `Más vistos`
- [x] `Más leídos`
- [x] `Por fecha`

El resto de la navegación debe vivir en:

- [x] submenús de categoría
- [x] footer
- [x] páginas hub

### 5.3 Footer

El footer puede y debe ser estático.

Debe incluir:

- [x] más categorías nacionales
- [x] subcategorías editoriales y regionales curadas
- [x] categorías regionales principales
- [x] secciones de servicio
- [x] enlaces institucionales

### 5.4 Category submenus

Los submenús de categoría deben ser estáticos porque no cambian frecuentemente.

Cada categoría madre debe mostrar:

- [x] subcategorías relacionadas
- [x] enlaces a etiquetas útiles
- [x] enlaces a notas top
- [x] navegación a temas afines

### 5.5 Tag cloud global

Se propone agregar una nube de etiquetas antes del footer.

Características:

- [x] generada en deploy
- [x] sin request por visita
- [x] filtrada por relevancia editorial
- [x] basada en tags recientes o más frecuentes

Esto mejora:

- [x] internal linking
- [x] descubrimiento long-tail
- [x] rastreo semántico
- [x] navegación entre temas

### 5.6 Tag cloud por categoría

Cada categoría principal puede tener una nube de etiquetas asociada.

Ejemplo:

- [x] `Sucesos` -> tags de policía, tribunales, accidentes, seguridad
- [x] `Nacionales` -> política, economía, gobierno, servicios
- [x] `Deportes` -> fútbol, béisbol, vinotinto, torneo

### 5.7 Related posts

El módulo de notas relacionadas debe moverse a SSR o a precálculo en deploy.

Razones:

- [x] reduce dependencia de client-side
- [x] mejora rastreo de enlaces internos
- [x] baja requests innecesarios
- [x] mantiene mejor performance

### 5.8 Category pages

Las páginas de categorías principales deben sumar:

- [x] intro editorial corta
- [x] submenú fijo
- [x] nube de etiquetas relacionada
- [x] enlaces a notas destacadas
- [x] breadcrumbs

## 6. Cambios por prioridad

### P0

- [x] Reposicionar el home hacia cobertura nacional.
- [x] Volver estáticos los `Category submenus`.
- [x] Volver estáticos los `Footer links`.
- [x] Fortalecer categorías madre como hubs.

### P1

- [x] Agregar nube de etiquetas global precomputada en deploy.
- [x] Agregar nube de etiquetas por categoría.
- [x] Pasar `Related posts` a SSR o precálculo.

### P2

- [x] Ajustar metadata del home y categorías clave para foco nacional.
- [x] Revisar sitemap para priorizar URLs útiles.
- [x] Consolidar canónicas y evitar duplicación de señales.

### P3

- [x] Subir visibilidad de módulos que ya generan interacción.
- [ ] Revisar densidad y ubicación de módulos de utilidad.

## 7. Mapa de archivos sugerido

### Home

- [x] `src/app/page.tsx`
- [x] `src/components/Header/index.tsx`
- [x] `src/components/MobileRankingLinks/index.tsx`

### Footer

- [x] `src/components/Footer/index.tsx`
- [x] `src/lib/constants.ts`

### Categorías

- [x] `src/app/(category)/categoria/[...slug]/page.tsx`
- [x] `src/lib/constants.ts`
- [x] nuevo componente para `CategorySubmenu`
- [x] nuevo componente para `CategoryTagCloud`

### Etiquetas

- [x] `src/app/(category)/etiqueta/[slug]/page.tsx`
- [x] nuevo componente para `TagCloud`

### Notas relacionadas

- [x] `src/components/RelatedPosts/index.tsx`
- [x] posible componente SSR o props precomputadas desde server

### Sitemap y metadata

- [x] `src/app/sitemap.ts`
- [x] `src/app/[posts]/[month]/[day]/[slug]/page.tsx`
- [x] `src/app/layout.tsx`
- [x] `src/lib/sharedOpenGraph.ts`

## 8. Reglas editoriales

- [x] La marca debe leerse como medio de Venezuela, no solo regional.
- [x] Lo regional debe existir como profundidad, no como único foco.
- [x] Cada nota debe empujar a:
  - [x] categoría
  - [x] tema relacionado
  - [x] nota relacionada
  - [x] tag útil
- [x] Las páginas clave deben tener texto contextual, no solo listados.
- [x] Toda navegación estratégica repetida debe ser estática o precomputada.

## 9. Métricas a seguir

### SEO

- [ ] impresiones orgánicas
- [ ] CTR orgánico
- [ ] posición media
- [ ] páginas indexadas vs no indexadas
- [ ] cobertura de sitemap

### CTR interno

- [ ] clicks por módulo
- [ ] clicks a categorías madre
- [ ] clicks a tags
- [ ] clicks a notas relacionadas
- [ ] páginas por sesión

### Percepción de marca

- [ ] aumento de consultas con `Noticiascol` y variantes de marca
- [ ] aumento de tráfico a categorías nacionales
- [ ] reducción relativa del peso de entrada regional pura

## 10. Definición de éxito

Se considera que el plan está funcionando si:

- [ ] sube el CTR orgánico de las páginas principales
- [ ] sube el tráfico a categorías madre nacionales
- [ ] mejora el CTR interno entre módulos editoriales
- [ ] baja la dependencia de requests dinámicos para navegación
- [ ] `Noticiascol` gana más presencia como medio venezolano

## 11. Qué debe ser estático

Estas piezas no necesitan request por visita y deberían vivir como configuración o artefacto generado:

- [x] `Footer links`
- [x] `Category submenus`
- [x] `Tag cloud global`
- [x] `Tag cloud por categoría`
- [x] `links editoriales del home`
- [x] `bloques de hubs nacionales`

Regla práctica:

- si el contenido no cambia por request, no debe vivir en un fetch runtime
- si el contenido cambia solo cuando se publica un lote nuevo, puede generarse en deploy
- si el contenido depende de relevancia editorial, conviene precalcularlo y versionarlo

## 12. Qué puede seguir dinámico

Hay componentes que sí pueden seguir siendo dinámicos porque dependen de ranking, recencia o interacción:

- [ ] `Most visited`
- [ ] `Most read`
- [ ] `Today news`
- [ ] `Trending`
- [ ] `Related posts` solo si no se puede precalcular en deploy

La meta no es eliminar lo dinámico, sino reservarlo para lo que realmente cambia con frecuencia o necesita personalización.

## 13. Plan de ejecución recomendado

### Fase 1

- [x] Definir la nueva jerarquía de marca para el home.
- [x] Convertir `Footer links` y `Category submenus` en estáticos.
- [x] Crear el primer `Tag cloud` global precomputado.

### Fase 2

- [x] Agregar `Tag cloud` por categoría principal.
- [x] Reorganizar el home alrededor de `Venezuela` y `Nacionales`.
- [x] Reducir la prominencia de módulos regionales en el primer pantallazo.

### Fase 3

- [x] Pasar `Related posts` a SSR o a payload precomputado.
- [x] Ajustar titles, descriptions y textos de categoría.
- [x] Revisar sitemap y canónicas para concentrar señales.

### Fase 4

- [ ] Medir impacto en Search Console y Analytics.
- [ ] Ajustar por data real, no por intuición.
- [ ] Repetir con iteraciones pequeñas.

## 14. Criterios de implementación

Antes de tocar código, cada cambio debería responder estas preguntas:

- [x] ¿Mejora indexación?
- [x] ¿Mejora CTR interno?
- [x] ¿Reduce requests?
- [x] ¿Ayuda a que la marca se perciba más nacional?
- [x] ¿Evita duplicar señales?

Si la respuesta es no en la mayoría de los casos, el cambio no entra en esta fase.

## 15. Nota operativa

Este documento es la referencia central del plan.
Si se crea nueva documentación específica de implementación, debe enlazar aquí y no duplicar decisiones.

## 16. Siguiente paso práctico

- [x] Traducir este plan en tareas concretas por archivo.
- [x] Separar lo estático de lo dinámico en `src/lib/constants.ts`.
- [x] Diseñar el componente de `TagCloud` y el submenú de categorías.
- [x] Preparar el rediseño del home con la nueva jerarquía nacional.
