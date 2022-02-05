import { ChevronUpIcon } from '@heroicons/react/outline'
import { format } from 'date-fns'

import { Container } from '..'
import { Logo, LogoType } from '../Logo'

const today: Date = new Date()

type FooterProps = {}

const defaultProps = {}

const Footer = () => {
  return (
    <footer className='relative text-sm bg-darkBlue text-gray'>
      <div className='absolute p-1 text-white rounded cursor-pointer hover:-top-5 -top-3 right-6 bg-primary ease-in duration-150'>
        <ChevronUpIcon className='w-7 h-7' />
      </div>
      <div className='text-xs bg-darkBlue'>
        <Container className='pt-12 pb-8'>
          <div className='flex flex-col md:flex-row'>
            <div className='max-w-lg col md:basis-2/5 lg:basis-3/6 lg:pr-40 md:max-w-full'>
              <Logo type={LogoType.logonameb} width={140} height={26} />
              <h6 className='pt-4 pr-4 leading-5'>
                El Diario Digital de la Costa Oriental del Lago, el Zulia y
                Venezuela. Noticias del Zulia, Cabimas, Maracaibo, Ciudad Ojeda,
                Caracas al día y las 24 horas.
              </h6>
              <div className='flex py-4'>
                <a href='#!' className='mr-6 hover:text-white ease-in-out'>
                  <svg
                    aria-hidden='true'
                    focusable='false'
                    data-prefix='fab'
                    data-icon='facebook-f'
                    className='w-2.5'
                    role='img'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 320 512'
                  >
                    <path
                      fill='currentColor'
                      d='M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z'
                    ></path>
                  </svg>
                </a>
                <a href='#!' className='mr-6 hover:text-white ease-in-out'>
                  <svg
                    aria-hidden='true'
                    focusable='false'
                    data-prefix='fab'
                    data-icon='twitter'
                    className='w-4'
                    role='img'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 512 512'
                  >
                    <path
                      fill='currentColor'
                      d='M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z'
                    ></path>
                  </svg>
                </a>
                <a href='#!' className='mr-6 hover:text-white ease-in-out'>
                  <svg
                    aria-hidden='true'
                    focusable='false'
                    data-prefix='fab'
                    data-icon='instagram'
                    className='w-3.5'
                    role='img'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 448 512'
                  >
                    <path
                      fill='currentColor'
                      d='M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z'
                    ></path>
                  </svg>
                </a>
                <a href='#!' className='mr-6 hover:text-white ease-in-out'>
                  <svg
                    aria-hidden='true'
                    focusable='false'
                    data-prefix='fab'
                    data-icon='linkedin-in'
                    className='w-3.5'
                    role='img'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 448 512'
                  >
                    <path
                      fill='currentColor'
                      d='M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z'
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
            <div className='col md:basis-1/5 lg:basis-1/5 md:pt-8'>
              <ul>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Noticias del Zulia
                  </a>
                </li>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Noticias de Sucesos
                  </a>
                </li>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Noticias de Curiosidades
                  </a>
                </li>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Noticias de Deportes
                  </a>
                </li>
              </ul>
            </div>
            <div className='col md:basis-1/5 lg:basis-1/5 md:pt-8'>
              <ul>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Noticias del Zulia
                  </a>
                </li>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Noticias de Sucesos
                  </a>
                </li>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Noticias de Curiosidades
                  </a>
                </li>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Noticias de Deportes
                  </a>
                </li>
              </ul>
            </div>
            <div className='col md:basis-1/5 lg:basis-1/5 md:pt-8'>
              <ul>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Contáctanos
                  </a>
                </li>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Publicidad
                  </a>
                </li>
                <li className='list-none'>
                  <a
                    href='#!'
                    className='inline-block pb-3 hover:text-white md:pb-2 ease'
                  >
                    Notas de Prensa
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>
      <div className='text-xs text-gray bg-primary'>
        <Container className='py-2 text-center'>
          <span className='col'>
            2012 - {format(today, 'yyyy')} &copy; Mas Multimedios C.A.
            J-40279329-4 <span className='hidden px-2 md:inline-block'>|</span>{' '}
            <br className='md:hidden' />
            <a className='hover:text-white ease' href='#!'>
              Aviso de Privacidad
            </a>
            <span className='px-2'>|</span>
            <a className='hover:text-white ease' href='#!'>
              Términos y Condiciones
            </a>
            <span className='px-2'>|</span>
            <a className='hover:text-white ease' href='#!'>
              Aviso de Cookies
            </a>
          </span>
        </Container>
      </div>
    </footer>
  )
}

Footer.defaultProps = defaultProps

export { Footer }
export type { FooterProps }
