import { Container } from '@components/Container'
import { MenuLink } from '@components/SideNav/MenuLink'
import { HOME_QUICK_LINKS } from '@lib/constants'

const MainMenu = () => {
  return (
    <div className='shadow-menu flex w-full items-center border-b border-solid border-slate-200 font-sans xl:shadow-none dark:border-neutral-500 dark:bg-neutral-800'>
      <Container
        className='scrolling-touch scrolling-auto scrollbar flex h-12 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-row items-center justify-center gap-2 overflow-auto py-1 text-sm'
        tag='nav'
      >
        {HOME_QUICK_LINKS.map(item => (
          <MenuLink key={item.name} item={item} main className='!pt-0' />
        ))}
      </Container>
    </div>
  )
}

export { MainMenu }
