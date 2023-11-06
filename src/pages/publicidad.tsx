import { NextPage } from 'next'

import { LegalPage } from '@components/LegalPage'

type LegalPageProps = {
  children: React.ReactNode
  title: string
}

const Index: NextPage<LegalPageProps> = () => {
  return (
    <LegalPage title='Publicidad'>
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

export default Index
