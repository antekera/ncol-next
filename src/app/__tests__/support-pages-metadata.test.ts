import { metadata as searchMetadata } from '../(clean)/busqueda/page'
import { metadata as contactMetadata } from '../(clean)/contacto/page'
import { metadata as privacyMetadata } from '../(clean)/privacidad/page'
import { metadata as termsMetadata } from '../(clean)/terminos-y-condiciones/page'
import { metadata as denunciasMetadata } from '../denuncias/page'

describe('support pages metadata', () => {
  it('marks support pages as noindex while preserving crawl paths', () => {
    expect(searchMetadata.robots).toEqual({ index: false, follow: true })
    expect(contactMetadata.robots).toEqual({ index: false, follow: true })
    expect(privacyMetadata.robots).toEqual({ index: false, follow: true })
    expect(termsMetadata.robots).toEqual({ index: false, follow: true })
    expect(denunciasMetadata.robots).toEqual({ index: false, follow: true })
  })
})
