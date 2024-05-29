import { Fragment } from 'react'

import { format } from 'date-fns'

import { ButtonGoTop } from '@components/ButtonGoTop'
import { Container } from '@components/Container'
import { MenuLink } from '@components/SideNav/MenuLink'
import { SocialLinks } from '@components/SocialLinks'
import {
  COMPANY_NAME,
  FOOTER_DESCRIPTION,
  MAIN_MENU,
  MENU_C
} from '@lib/constants'

import { Logo } from '../Logo'

const Footer = () => {
  const today = new Date()
  const COLUMN_A = MAIN_MENU.slice(1, 6)
  const COLUMN_B = MAIN_MENU.slice(7, 12)
  const COLUMN_C = MENU_C.slice(0, 2)
  const BOTTOM_BAR = MENU_C.slice(2, 5)

  return (
    <footer className='footer relative bg-darkBlue text-sm text-slate-300'>
      <ButtonGoTop />
      <div className='bg-darkBlue text-xs'>
        <Container className='pb-8 pt-12'>
          <div className='flex flex-col md:flex-row'>
            <div className='col max-w-lg md:max-w-full md:basis-2/5 lg:basis-3/6 lg:pr-40'>
              <Logo type='logonameb' width={140} height={26} />
              <h6 className='pr-4 pt-4 leading-5'>{FOOTER_DESCRIPTION}</h6>
              <div className='flex py-4'>
                <SocialLinks />
              </div>
            </div>
            <div className='col md:basis-1/5 md:pt-8 lg:basis-1/5'>
              <ul>
                {COLUMN_A.map((name, i) => (
                  <MenuLink key={i} name={name} footer prefix />
                ))}
              </ul>
            </div>
            <div className='col md:basis-1/5 md:pt-8 lg:basis-1/5'>
              <ul>
                {COLUMN_B.map((name, i) => (
                  <MenuLink key={i} name={name} footer prefix />
                ))}
              </ul>
            </div>
            <div className='col md:basis-1/5 md:pt-8 lg:basis-1/5'>
              <ul>
                {COLUMN_C.map((name, i) => (
                  <MenuLink key={i} name={name} footer staticPage />
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </div>
      <div className='bg-primary text-xs text-slate-300'>
        <Container className='py-2 text-center'>
          <span className='col'>
            2012 - {today && format(today, 'yyyy')} &copy; {COMPANY_NAME}
            J-40279329-4 <span className='hidden px-2 md:inline-block'>|</span>
            <br className='md:hidden' />
            {BOTTOM_BAR.map((name, i) => {
              if (i === 0)
                return <MenuLink key={i} name={name} staticPage bottomBar />
              return (
                <Fragment key={i}>
                  <span className='px-2'>|</span>
                  <MenuLink name={name} staticPage bottomBar />
                </Fragment>
              )
            })}
          </span>
        </Container>
      </div>
    </footer>
  )
}

export { Footer }
