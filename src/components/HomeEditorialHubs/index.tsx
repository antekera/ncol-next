import Link from 'next/link'
import { HOME_EDITORIAL_HUBS } from '@lib/constants'

const HomeEditorialHubs = () => {
  return (
    <section
      aria-labelledby='home-editorial-hubs-title'
      className='mb-8 rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_45%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.96))] p-5 shadow-sm dark:border-neutral-800 dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_40%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(3,7,18,0.98))]'
    >
      <div className='mb-4 flex flex-col gap-2'>
        <p className='font-sans text-[11px] font-bold tracking-[0.28em] text-sky-700 uppercase dark:text-sky-300'>
          Noticiascol en Venezuela
        </p>
        <h2
          id='home-editorial-hubs-title'
          className='font-serif text-2xl leading-tight text-slate-950 dark:text-white'
        >
          Noticias de Venezuela con contexto y despliegue territorial
        </h2>
        <p className='max-w-2xl text-sm leading-6 text-slate-600 dark:text-neutral-300'>
          Noticias de Venezuela hoy, seguimiento a sucesos y una lectura
          editorial que conecta la agenda nacional con las regiones.
        </p>
      </div>
      <div className='grid gap-3 md:grid-cols-2'>
        {HOME_EDITORIAL_HUBS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className='group rounded-2xl border border-slate-200/80 bg-white/90 p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:border-sky-700'
          >
            <p className='mb-2 font-sans text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase dark:text-neutral-400'>
              {item.eyebrow}
            </p>
            <h3 className='font-sans text-lg font-semibold text-slate-950 transition-colors group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-300'>
              {item.name}
            </h3>
            <p className='mt-2 text-sm leading-6 text-slate-600 dark:text-neutral-300'>
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { HomeEditorialHubs }
