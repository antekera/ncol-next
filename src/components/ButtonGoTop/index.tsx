import { GAEvent } from '@lib/utils/ga'

const ButtonGoTop = () => {
  const goToTop = () => {
    GAEvent({
      category: 'GO_TOP_BUTTON',
      label: 'GO_TOP_FOOTER'
    })
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  return (
    <button
      onClick={goToTop}
      className='link-go-top absolute -top-3 right-6 h-9 w-9 cursor-pointer rounded border-none bg-primary text-white duration-150 ease-in hover:-top-4'
    >
      <span className='material-symbols-rounded mt-3 inline-block !text-3xl !leading-4'>
        keyboard_control_key
      </span>
    </button>
  )
}

export { ButtonGoTop }
