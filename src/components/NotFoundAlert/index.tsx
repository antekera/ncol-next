import { ChevronRight, TriangleAlert } from 'lucide-react'
import Link from 'next/link'

import { CMS_URL } from '@lib/constants'

const title = 'Página no encontrada'

const NotFoundAlert = () => {
  return (
    <div className='mt-6 mb-6 flex w-full justify-center rounded-md bg-slate-100 py-8 dark:bg-neutral-700'>
      <div className='flex flex-col text-center'>
        <TriangleAlert color={'red'} className='mx-auto' size={32} />
        <h1 className='mt-2 font-sans text-2xl text-slate-900 uppercase dark:text-neutral-300'>
          {title}
        </h1>
        <p className='mb-3 px-4 font-sans text-sm md:mb-4 md:text-base dark:text-neutral-300'>
          La página solicitada no existe o fue borrada.
        </p>

        <Link
          href={CMS_URL}
          className='text-primary hover:text-secondary mx-auto flex inline-block items-center font-sans dark:text-neutral-300 dark:hover:text-neutral-100'
        >
          <div className='flex'>
            Ir al inicio <ChevronRight size={20} className='mt-[2px]' />
          </div>
        </Link>
      </div>
    </div>
  )
}

export { NotFoundAlert }
