import Link from 'next/link'

export interface HeaderProps {
  title?: string
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <h2 className='bg-orange'>
      <Link href='/'>
        <a className='finst-sans hover:underline'>Blog2 - {title}</a>
      </Link>
      .
    </h2>
  )
}

export default Header
