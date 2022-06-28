import { LogoType } from '../Logo'

export const logoMobileOptions = (isHeaderPrimary: boolean) => {
  return {
    type: isHeaderPrimary ? LogoType.logonameb : LogoType.logoname,
    width: 140,
    height: 28,
  }
}

export const logoDesktopOptions = (isHeaderPrimary: boolean) => {
  return {
    type: isHeaderPrimary ? LogoType.logocomb : LogoType.logocom,
    width: 220,
    height: 32,
  }
}
