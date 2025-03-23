import { Metadata } from 'next'
import { LegalPage } from '@components/LegalPage'

const title = 'Resultados de la búsqueda'

export const metadata: Metadata = {
  title
}

export default function Page() {
  return (
    <>
      <LegalPage title={title}>
        <div className='gcse-searchresults' />
      </LegalPage>
    </>
  )
}
