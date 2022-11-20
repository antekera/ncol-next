import { NextPage } from 'next'

import { LegalPage } from '@components/LegalPage'

type LegalPageProps = {
  children: React.ReactNode
  title: string
}

const Index: NextPage<LegalPageProps> = () => {
  return (
    <LegalPage title='Contactos'>
      <p className='text-lg'>
        Para notas de prensa y contactos en general puedes hacerlo al correo:
      </p>
      <p className='text-lg'>
        <a href='mailto:prensa@noticiascol.com'>prensa@noticiascol.com</a>
      </p>
    </LegalPage>
  )
}

export default Index
