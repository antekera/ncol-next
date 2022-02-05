import { Container } from '../../'

const MainMenu = () => {
  const menu = [
    'Inicio',
    'Costa Oriental',
    'Sucesos',
    'Nacionales',
    'Economía',
    'Política',
    'Farándula',
    'Internacionales',
    'Salud',
    'Curiosidades',
    'Tecnología',
    'Deportes',
  ]

  const activeMenuItem = 'Costa Oriental'

  return (
    <div className='flex items-center w-full border-b border-lightGray shadow-menu xl:shadow-none'>
      <Container
        className='flex flex-row overflow-auto scrolling-touch scrolling-auto text-sm space-x-1 scrollbar scrollbar-thumb-lightGray scrollbar-track-transparent h-[44px] md:h-[54px] xl:h-[auto] scrollbar-thin'
        tag='nav'
      >
        {menu.map((item, i) => (
          <a
            key={i}
            href='#'
            className={`block px-3 -mx-3 text-darkGray hover:bg-lightGray hover:text-darkBlue ease-in duration-150 whitespace-nowrap ${
              item === activeMenuItem ? 'hover:bg-white' : ''
            }`}
          >
            <span
              className={`block py-2 md:py-3 ${
                item === activeMenuItem ? 'border-b-2 border-primary' : ''
              }`}
            >
              {item}
            </span>
          </a>
        ))}
      </Container>
    </div>
  )
}

export { MainMenu }
