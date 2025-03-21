import { AdDfpSlot } from '@components/AdDfpSlot'
import { Newsletter } from '@components/Newsletter'

interface Props {
  adID: string
  adID2: string
  style: React.CSSProperties
  children?: React.ReactNode
}

const Sidebar = ({ adID2, children, style }: Partial<Props>) => {
  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      {adID2 && (
        <AdDfpSlot
          id={adID2}
          className='show-mobile mb-4'
          style={style ?? {}}
        />
      )}

      <Newsletter className='hidden md:block' />
      {children && <div className='mb-4'>{children}</div>}

      <div className='show-desktop'>
        <AdDfpSlot id={adID2} className='mb-4' style={style ?? {}} />
      </div>
    </aside>
  )
}

export { Sidebar }
