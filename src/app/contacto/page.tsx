import { Metadata } from 'next'

import { LegalPage } from '@components/LegalPage'

const title = 'Contactos'

export const metadata: Metadata = {
  title
}

export default function Page() {
  return (
    <LegalPage title={title}>
      <p className='text-lg'>
        Para notas de prensa y contactos en general puedes hacerlo al correo:
      </p>
      <p className='text-lg'>
        <a href='mailto:prensa@noticiascol.com'>prensa@noticiascol.com</a>
      </p>
    </LegalPage>
  )
}
