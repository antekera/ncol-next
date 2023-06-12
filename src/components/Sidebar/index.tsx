import { AdDfpSlot } from '@components/AdDfpSlot'
import { Newsletter } from '@components/Newsletter'

interface Props {
  adID: string
  adID2: string
  children?: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
const Sidebar = ({ adID, adID2, children }: Partial<Props>) => {
  return (
    <aside className='w-full px-2 md:w-1/3 lg:w-1/4'>
      {adID2 && <AdDfpSlot id={adID2} className='mb-4 show-mobile' />}

      <Newsletter className='hidden md:block' />
      {children && <div className='mb-4'>{children}</div>}

      <div className='show-desktop'>
        <AdDfpSlot id={adID2} className='mb-4' />
      </div>
    </aside>
  )
}

export { Sidebar }
