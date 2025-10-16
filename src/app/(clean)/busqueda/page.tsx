import { Metadata } from 'next'
import './busqueda-page.css'

const title = 'Resultados de la búsqueda'

export const metadata: Metadata = {
  title
}

export default function Page() {
  return (
    <>
      <h1 className='busqueda-page-title'>{title}</h1>
      <div className='gcse-searchbox' />
      <div className='gcse-searchresults' />
    </>
  )
}