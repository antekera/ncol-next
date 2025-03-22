import { render } from '@testing-library/react'

import { Excerpt } from '..'

const rawText =
  '<p>Cómo reservado y delicado fue calificado el estado de salud del Alcalde del Municipio Miranda Jorge Nava, luego de ser víctima de un sicariato en horas de la madrugada de este martes en esta localidad. Nava, se encontraba participando en la conocida Feria conocida como vuelta al terruño en el sector el Terraplén de esta [&hellip;]</p>\n'

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
