import classNames from 'classnames'

import { Logo } from '../Logo'

enum HeaderType {
  Main = 'main',
  Category = ' category',
  Single = 'single',
  Share = 'share',
}

export interface HeaderProps {
  title?: string
  type?: HeaderType
  compact?: boolean
  className?: string
}

export const Header = ({
  title,
  className,
  type = HeaderType.Main,
  compact,
}: HeaderProps) => {
  const classes = classNames(
    'flex items-center justify-between py-4',
    { compact: compact },
    className
  )
  return (
    <header className={classes}>
      <div>1</div>
      <div>
        <Logo />
      </div>
      <div>3</div>
    </header>
  )
}
