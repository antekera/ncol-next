'use client'

import Link from 'next/link'
import { GAEvent } from '@lib/utils/ga'
import LogoSquare from './versions/LogoSquare'
import Logocom from './versions/Logocom'
import Logocomb from './versions/Logocomb'
import Logoname from './versions/Logoname'
import Logonameb from './versions/Logonameb'
import { GA_EVENTS } from '@lib/constants'

export enum LogoType {
  logocom = 'logocom',
  logocomb = 'logocomb',
  logoname = 'logoname',
  logonameb = 'logonameb',
  logosquare = 'logosquare'
}

type LogoProps = {
  type?: string
  width?: number
  height?: number
  location: string
}

const logos: { [key: string]: any } = {
  logocom: Logocom,
  logocomb: Logocomb,
  logoname: Logoname,
  logonameb: Logonameb,
  logosquare: LogoSquare
}

const Logo = ({
  type = LogoType.logocom,
  width,
  height,
  location
}: LogoProps) => {
  const IconComponent = logos[`${type}`]
  const dataLayer = {
    category: GA_EVENTS.LOGO.CATEGORY,
    label: `${GA_EVENTS.LOGO.PREFIX}${location.toUpperCase()}`
  }

  return (
    <Link href='/' className='link-logo' onClick={() => GAEvent(dataLayer)}>
      <IconComponent type={type} width={width} height={height} />
    </Link>
  )
}

export { Logo }
export type { LogoProps }