import { Container } from '@components/Container'
import { MenuLink } from '@components/SideNav/MenuLink'
import { MAIN_MENU } from '@lib/constants'

const MainMenu = () => {
  return (
    <div className='flex items-center w-full border-b border-solid border-slate-200 shadow-menu xl:shadow-none'>
      <Container
        className='flex flex-row overflow-auto scrolling-touch scrolling-auto text-sm space-x-1 scrollbar scrollbar-thumb-slate-200 scrollbar-track-transparent h-[44px] md:h-[54px] xl:h-[auto] scrollbar-thin'
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
