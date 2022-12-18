import React from 'react'

import { render } from '@testing-library/react'

import { Excerpt } from '..'

const rawText =
  '<p>La espera se terminó: el Mundial Qatar 2022 se puso en marcha con una ceremonia inaugural a pura música y color en el estadio Al Bayt. Más de 60 mil espectadores&#8230;  <a class="button-cta" data-category="Read more link" href="https://admin.noticiascol.com/2022/11/20/inicio-la-inauguracion-del-mundial-de-qatar-2022/" title="Leer Mundial de Qatar 2022: Se dio inicio a la fiesta mundialista">Leer noticia &raquo;</a></p>\n'

describe('Excerpt', () => {
  test('should match snapshots', () => {
    const { container } = render(<Excerpt text={rawText} />)
    expect(container.firstChild).toMatchSnapshot()
  })

  test('should no render if text is undefined', () => {
    const { container } = render(<Excerpt />)
    expect(container.firstChild).toBeNull()
  })
})
