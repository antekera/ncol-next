type ExcerptProps = {
  text: string
}

const Excerpt = ({ text }: ExcerptProps) => {
  return (
    <p className='hidden mb-3 text-sm sm:text-md lg:text-base text-slate-500 sm:block'>
      {text.replace(/&nbsp; |<p>|<p>&nbsp; |(&#8230)[\s\S]*$/gim, '')} ...
    </p>
  )
}

export { Excerpt }
export type { ExcerptProps }
