import { Metadata } from 'next'

const title = 'Resultados de la búsqueda'

export const metadata: Metadata = {
  title
}

export default function Page() {
  return (
    <>
      <h1 className='mb-4 font-sans text-3xl md:text-4xl dark:text-neutral-300'>
        {title}
      </h1>
      <div className='gcse-searchbox' />
      <div className='gcse-searchresults' />
    </>
  )
}
