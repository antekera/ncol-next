import { Container } from '@components/Container'
import { MenuLink } from '@components/SideNav/MenuLink'
import { MAIN_MENU } from '@lib/constants'

const MainMenu = () => {
  return (
    <div className='shadow-menu flex w-full items-center border-b border-solid border-slate-200 font-sans xl:shadow-none dark:border-neutral-500 dark:bg-neutral-800'>
      <Container
        className='scrolling-touch scrolling-auto scrollbar scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 -ml-3 flex h-10 flex-row space-x-1 overflow-auto text-sm sm:mx-auto md:justify-center'
        tag='nav'
      >
        {MAIN_MENU.map((item, index) => (
          <MenuLink
            key={item.name}
            item={item}
            main
            className={index === 0 ? 'hidden md:block' : ''}
          />
        ))}
      </Container>
    </div>
  )
}

export { MainMenu }
