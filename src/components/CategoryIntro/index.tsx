import { getCategoryPageDescription } from '@lib/constants'

type Props = {
  slug: string
}

const CategoryIntro = ({ slug }: Props) => {
  const description = getCategoryPageDescription(slug)

  if (!description) return null

  return (
    <section className='mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-neutral-800 dark:bg-neutral-900'>
      <p className='text-sm leading-6 text-slate-700 dark:text-neutral-300'>
        {description}
      </p>
    </section>
  )
}

export { CategoryIntro }
