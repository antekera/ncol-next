import Link from 'next/link'
import { HOME_EDITORIAL_HUBS } from '@lib/constants'

const HomeEditorialHubs = () => {
  return (
    <section
      aria-label='Secciones editoriales'
      className='border-t-4 [border-top-color:var(--color-dark-blue)] bg-white dark:bg-neutral-950'
    >
      <div className='flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-neutral-700'>
        <p className='font-sans text-[10px] font-bold tracking-[0.22em] text-slate-500 uppercase dark:text-neutral-400'>
          Explora Noticiascol
        </p>
      </div>
      <div className='divide-y divide-slate-100 md:grid md:grid-cols-4 md:divide-x md:divide-y-0 dark:divide-neutral-800'>
        {HOME_EDITORIAL_HUBS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='group flex items-start justify-between gap-3 px-4 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900'
          >
            <div>
              <p className='mb-0.5 font-sans text-[9px] font-semibold tracking-[0.2em] text-slate-400 uppercase dark:text-neutral-500'>
                {item.eyebrow}
              </p>
              <h3 className='font-serif text-base leading-tight font-bold text-slate-900 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-2 dark:text-white'>
                {item.name}
              </h3>
            </div>
            <span className='mt-1 shrink-0 font-sans text-lg leading-none font-thin text-slate-300 dark:text-neutral-600'>
              &rsaquo;
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { HomeEditorialHubs }
