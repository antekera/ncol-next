import Link from 'next/link'

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
  logosquare = 'logosquare',
}

type LogoProps = {
  type?: LogoType
  width?: number
  height?: number
}

const defaultProps = {
  type: LogoType.logocom,
}

const logos: { [key: string]: any } = {
  logocom: Logocom,
  logocomb: Logocomb,
  logoname: Logoname,
  logonameb: Logonameb,
  logosquare: LogoSquare,
}

const Logo = ({ type = LogoType.logocom, width, height }: LogoProps) => {
  const IconComponent = logos[type]

  return (
    <Link href='/' passHref>
      <a>
        <IconComponent type={type} width={width} height={height} />
      </a>
    </Link>
  )
}

Logo.defaultProps = defaultProps

export { Logo }
export type { LogoProps }
