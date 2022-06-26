import { format } from 'date-fns'

import { FOOTER_DESCRIPTION } from 'lib/constants'
import { usePageStore } from 'lib/hooks/store'

import { Container, ButtonGoTop, SocialLinks } from '..'
import { Logo, LogoType } from '../Logo'

const today: Date = new Date()

const Footer = () => {
  const isLoading = usePageStore(state => state.isLoading)

  return (
    <footer className='relative text-sm bg-darkBlue text-slate-400'>
      {!isLoading && <ButtonGoTop />}
      <div className='text-xs bg-darkBlue'>
        <Container className='pt-12 pb-8'>
          <div className='flex flex-col md:flex-row'>
            <div className='max-w-lg col md:basis-2/5 lg:basis-3/6 lg:pr-40 md:max-w-full'>
              <Logo type={LogoType.logonameb} width={140} height={26} />
              <h6 className='pt-4 pr-4 leading-5'>{FOOTER_DESCRIPTION}</h6>
              <div className='flex py-4'>
                <SocialLinks />
              </div>
            </div>
            {!isLoading && (
              <>
                <div className='col md:basis-1/5 lg:basis-1/5 md:pt-8'>
                  <ul>
                    <li className='list-none'>
                      <a
                        href='#!'
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
                      >
                        Noticias del Zulia
                      </a>
                    </li>
                    <li className='list-none'>
                      <a
                        href='#!'
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
                      >
                        Noticias de Sucesos
                      </a>
                    </li>
                    <li className='list-none'>
                      <a
                        href='#!'
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
                      >
                        Noticias de Curiosidades
                      </a>
                    </li>
                    <li className='list-none'>
                      <a
                        href='#!'
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
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
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
                      >
                        Noticias del Zulia
                      </a>
                    </li>
                    <li className='list-none'>
                      <a
                        href='#!'
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
                      >
                        Noticias de Sucesos
                      </a>
                    </li>
                    <li className='list-none'>
                      <a
                        href='#!'
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
                      >
                        Noticias de Curiosidades
                      </a>
                    </li>
                    <li className='list-none'>
                      <a
                        href='#!'
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
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
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
                      >
                        Contáctanos
                      </a>
                    </li>
                    <li className='list-none'>
                      <a
                        href='#!'
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
                      >
                        Publicidad
                      </a>
                    </li>
                    <li className='list-none'>
                      <a
                        href='#!'
                        className='inline-block pb-3 hover:text-white md:pb-2 ease duration-200'
                      >
                        Notas de Prensa
                      </a>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </Container>
      </div>
      <div className='text-xs text-slate-300 bg-primary'>
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

export { Footer }
