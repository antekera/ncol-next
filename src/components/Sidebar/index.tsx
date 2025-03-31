'use client'

import { Newsletter } from '@components/Newsletter'
import { Ad } from '@components/Sidebar/Ad'

interface Props {
  children?: React.ReactNode
  offsetTop?: number
}

const Sidebar = ({ children, offsetTop }: Partial<Props>) => {
  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      <Newsletter className='hidden md:block' />
      {children && <div className='mb-4'>{children}</div>}
      <Ad offsetTop={offsetTop} />
    </aside>
  )
}

export { Sidebar }
