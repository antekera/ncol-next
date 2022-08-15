import { ChevronUpIcon } from '@heroicons/react/outline'

const ButtonGoTop = () => {
  const goToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  return (
    <button
      onClick={goToTop}
      className='absolute p-1 text-white border-solid border-none rounded cursor-pointer link-go-top hover:-top-5 -top-3 right-6 bg-primary ease-in duration-150'
    >
      <ChevronUpIcon className='w-7 h-7' />
    </button>
  )
}

export { ButtonGoTop }
