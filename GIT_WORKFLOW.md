# Flujo de Git

`feature/*` / `fix/*` / `chore/*` → **develop** → **main** → Vercel producción.

## Trabajo diario

- `develop` es la rama predeterminada de GitHub y la base de nuevas ramas y PR.
- Crear las ramas desde `origin/develop`; todos los PR de trabajo apuntan a `develop`.
- Todos los PR se integran con **Squash and merge**, incluidos los de publicación.
- CI exige `Branch policy`, `Git workflow tests` y `Lint + Tests`.
- Dependabot apunta a `develop`; sus actualizaciones menores y parches conservan auto-merge con squash.
- `main` y `develop` están protegidas contra borrado y force push. Los cambios de trabajo requieren PR.

```bash
git fetch origin
git switch -c feat/mi-cambio origin/develop
git push -u origin feat/mi-cambio
gh pr create --base develop
```

## Publicar

El mantenedor crea manualmente el PR de publicación:

```bash
gh pr create --base main --head develop --title 'release: descripción de la publicación'
```

Tras pasar CI, integrar con **Squash and merge**. Solo `develop` del propio
repositorio puede ser origen de un PR a `main`. Conservar siempre `develop`.
El push a `main` ejecuta el deploy existente a Vercel; el workflow de
sincronización se ejecuta al cerrar el PR fusionado, independientemente del deploy.
Si el deploy falla, corregir mediante otro PR a `develop` y otra publicación,
o usar el rollback de Vercel.

## Sincronización tras el squash

Squash crea un commit diferente en `main`. El workflow **Sync develop after release**
agrega un commit técnico de merge en `develop` para registrar `main` como ancestro.
Los PR siguen integrándose exclusivamente con squash; este commit automático es
la excepción técnica acordada para mantener la historia sin reescribirla.

El script comprueba que el commit publicado tiene exactamente el árbol del head
de `develop` incluido en el PR. Después usa la estrategia Git `ours` para conservar
el contenido actual de `develop`, incluidos commits recibidos durante la publicación.
Esto evita conflictos artificiales del squash y conserva las ramas de trabajo abiertas.
Sin cambios nuevos, ambas ramas tienen el mismo contenido; los SHA son diferentes.
Con cambios nuevos, `develop` contiene además el trabajo pendiente de publicar.

La sincronización hace push normal, nunca force push, y vuelve a intentar si otra
actualización de `develop` gana la carrera. Si falla una validación o los tres intentos,
el workflow falla sin sobrescribir cambios. Revisar el error y usar **Re-run jobs**
en GitHub Actions. Los tests locales del flujo se ejecutan con:

```bash
node --test scripts/sync-development-branch.test.mjs
```

La clave de deploy **develop release sync** está guardada como secreto de Actions
`DEVELOP_SYNC_SSH_KEY`; permite el push técnico a `develop` mediante el bypass de
deploy keys de su regla de PR/CI. La regla de integridad sigue impidiendo borrar o
reescribir ramas y `main` no tiene bypass. Mantener las demás deploy keys en modo
solo lectura, ya que este tipo de bypass aplica a todas las deploy keys con escritura.

## Activación inicial

La configuración se integra primero en `develop`. La primera publicación manual
llevará estos workflows también a `main` y activará la sincronización de esa publicación.
Cambiar la rama predeterminada a `develop` no dispara un deploy de producción.
