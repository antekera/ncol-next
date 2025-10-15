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
  const COLUMN_A = MAIN_MENU.slice(0, 4)
  const COLUMN_B = MAIN_MENU.slice(4, 8)
  const COLUMN_C = MENU_C.slice(0, 1)
  const BOTTOM_BAR = MENU_C.slice(1, 5)

  return (
    <footer className='footer'>
      <ButtonGoTop />
      <div className='footer-top'>
        <Container className='footer-top-container'>
          <div className='footer-top-content'>
            <div className='footer-logo-section'>
              <Logo
                type='logonameb'
                width={140}
                height={26}
                location='footer'
              />
              <h6 className='footer-description'>{FOOTER_DESCRIPTION}</h6>
              <div className='footer-social-links'>
                <SocialLinks />
              </div>
            </div>
            <div className='footer-menu-column'>
              <ul>
                {COLUMN_A.map(item => (
                  <MenuLink key={item.name} item={item} footer prefix />
                ))}
              </ul>
            </div>
            <div className='footer-menu-column'>
              <ul>
                {COLUMN_B.map(item => (
                  <MenuLink key={item.name} item={item} footer prefix />
                ))}
              </ul>
            </div>
            <div className='footer-menu-column'>
              <ul>
                {COLUMN_C.map(item => (
                  <MenuLink key={item.name} item={item} footer />
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </div>
      <div className='footer-bottom'>
        <Container className='footer-bottom-container'>
          <span className='footer-bottom-content'>
            2012 - {today && format(today, 'yyyy')} &copy; {COMPANY_NAME}
            J-40279329-4 <span className='footer-bottom-separator'>|</span>
            <br className='footer-bottom-break' />
            {BOTTOM_BAR.map((item, i) => {
              if (i === 0)
                return <MenuLink key={item.name} item={item} bottomBar />
              return (
                <Fragment key={item.name}>
                  <span className='footer-bottom-link-separator'>|</span>
                  <MenuLink item={item} bottomBar />
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