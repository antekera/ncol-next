import Link from 'next/link'

import { GAEvent } from '@lib/utils/ga'

import Logocom from './versions/Logocom'
import Logocomb from './versions/Logocomb'
import Logoname from './versions/Logoname'
import Logonameb from './versions/Logonameb'
import LogoSquare from './versions/LogoSquare'

export enum LogoType {
  logocom = 'logocom',
  logocomb = 'logocomb',
  logoname = 'logoname',
  logonameb = 'logonameb',
  logosquare = 'logosquare'
}

type LogoProps = {
  type?: LogoType
  width?: number
  height?: number
}

const logos: { [key: string]: any } = {
  logocom: Logocom,
  logocomb: Logocomb,
  logoname: Logoname,
  logonameb: Logonameb,
  logosquare: LogoSquare
}

const Logo = ({ type = LogoType.logocom, width, height }: LogoProps) => {
  const IconComponent = logos[type]
  const dataLayer = {
    category: 'LOGO',
    label: `LOGO_${type.toUpperCase()}`
  }

  return (
    <Link href='/' className='link-logo' onClick={() => GAEvent(dataLayer)}>
      <IconComponent type={type} width={width} height={height} />
    </Link>
  )
}

export { Logo }
export type { LogoProps }
