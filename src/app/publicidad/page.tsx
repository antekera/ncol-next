import { Metadata } from 'next'

import { LegalPage } from '@components/LegalPage'

const title = 'Publicidad'

export const metadata: Metadata = {
  title
}

export default function Page() {
  return (
    <LegalPage title={title}>
      <picture className='relative mb-6 block h-auto w-full max-w-max text-left'>
        <img src='/media/tw.png' alt='Noticiascol' className='h-auto w-full' />
      </picture>
      <p className='text-lg'>
        Puedes consultar tarifas y planes publicitarios de nuestro sitio web y
        redes sociales en:
      </p>
      <p className='text-lg'>
        <a href='mailto:publicidad@noticiascol.com'>
          publicidad@noticiascol.com
        </a>
      </p>
    </LegalPage>
  )
}
