const ButtonGoTop = () => {
  const goToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  return (
    <button
      onClick={goToTop}
      className='absolute text-white border-solid border-none rounded cursor-pointer h-9 w-9 link-go-top hover:-top-4 -top-3 right-6 bg-primary ease-in duration-150'
    >
      <span className='inline-block mt-3 text-3xl material-symbols-rounded leading-4'>
        keyboard_control_key
      </span>
    </button>
  )
}

export { ButtonGoTop }
