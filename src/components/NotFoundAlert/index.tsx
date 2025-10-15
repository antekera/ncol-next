import { ChevronRight, TriangleAlert } from 'lucide-react'
import Link from 'next/link'

import { CMS_URL } from '@lib/constants'

const title = 'Página no encontrada'

const NotFoundAlert = () => {
  return (
    <div className='not-found-alert'>
      <div className='not-found-alert-content'>
        <TriangleAlert
          color={'red'}
          className='not-found-alert-icon'
          size={32}
        />
        <h1 className='not-found-alert-title'>{title}</h1>
        <p className='not-found-alert-description'>
          La página solicitada no existe o fue borrada.
        </p>

        <Link href={CMS_URL} className='not-found-alert-link'>
          <div className='not-found-alert-link-content'>
            Ir al inicio <ChevronRight size={20} />
          </div>
        </Link>
      </div>
    </div>
  )
}

export { NotFoundAlert }