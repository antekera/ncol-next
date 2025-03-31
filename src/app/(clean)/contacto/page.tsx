import { Metadata } from 'next'

const title = 'Contactos'

export const metadata: Metadata = {
  title
}

export default function Page() {
  return (
    <>
      <h1 className='mb-4 font-sans text-3xl md:text-4xl dark:text-neutral-300'>
        {title}
      </h1>
      <p className='text-lg dark:text-neutral-300'>
        Para notas de prensa y contactos en general puedes hacerlo al correo:
      </p>
      <p className='text-lg dark:text-neutral-300'>
        <a href='mailto:prensa@noticiascol.com'>prensa@noticiascol.com</a>
      </p>
    </>
  )
}
