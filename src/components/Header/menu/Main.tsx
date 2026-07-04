import { Container } from '@components/Container'
import { MenuLink } from '@components/SideNav/MenuLink'
import { MAIN_MENU } from '@lib/constants'

const MainMenu = () => {
  return (
    <div className='shadow-menu hidden w-full items-center border-b border-solid border-slate-200 font-sans md:flex xl:shadow-none dark:border-neutral-500 dark:bg-neutral-800'>
      <Container
        className='scrolling-touch scrolling-auto scrollbar flex h-12 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-row items-center justify-center gap-2 overflow-auto py-1 text-sm'
        tag='nav'
      >
        {MAIN_MENU.map(item => (
          <MenuLink key={item.name} item={item} main className='!pt-0' />
        ))}
      </Container>
    </div>
  )
}

export { MainMenu }
