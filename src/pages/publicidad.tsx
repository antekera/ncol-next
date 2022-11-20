import { NextPage } from 'next'

import { LegalPage } from '@components/LegalPage'

type LegalPageProps = {
  children: React.ReactNode
  title: string
}

const Index: NextPage<LegalPageProps> = () => {
  return (
    <LegalPage title='Publicidad'>
      <picture className='relative block w-full h-auto mb-6 text-left max-w-max'>
        <img src='/media/tw.png' alt='Noticiascol' className='w-full h-auto' />
      </picture>
      <p className='text-lg'>
        Puedes consultar tarifas y planes publicitarios de nuestro sitio web y
        redes sociales en:
      </p>
      <p className='text-lg'>
        <a href='mailto:prensa@noticiascol.com'>prensa@noticiascol.com</a>
      </p>
    </LegalPage>
  )
}

export default Index
