import { Container } from '@components/Container'
import { MenuLink } from '@components/SideNav/MenuLink'
import { MAIN_MENU } from '@lib/constants'

const MainMenu = () => {
  return (
    <div className='shadow-menu flex w-full items-center border-b border-solid border-slate-200 font-sans xl:shadow-none dark:border-neutral-500 dark:bg-neutral-800'>
      <Container
        className='scrolling-touch scrolling-auto scrollbar scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 flex h-[44px] flex-row space-x-1 overflow-auto text-sm md:h-[54px] xl:h-[auto]'
        tag='nav'
      >
        {MAIN_MENU.map((name, i) => (
          <MenuLink key={i} name={name} main />
        ))}
      </Container>
    </div>
  )
}

export { MainMenu }
