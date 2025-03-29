import { Metadata } from 'next'

const title = 'Publicidad'

export const metadata: Metadata = {
  title
}

export default function Page() {
  return (
    <>
      <h1 className='mb-4 font-sans text-3xl md:text-4xl dark:text-neutral-300'>
        {title}
      </h1>
      <picture className='relative mb-6 block h-auto w-full max-w-max text-left'>
        <img src='/media/tw.png' alt='Noticiascol' className='h-auto w-full' />
      </picture>
      <p className='text-lg dark:text-neutral-300'>
        Puedes consultar tarifas y planes publicitarios de nuestro sitio web y
        redes sociales en:
      </p>
      <p className='text-lg dark:text-neutral-300'>
        <a href='mailto:publicidad@noticiascol.com'>
          publicidad@noticiascol.com
        </a>
      </p>
    </>
  )
}
