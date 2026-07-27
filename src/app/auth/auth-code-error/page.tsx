import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Error de autenticación',
  robots: {
    index: false,
    follow: false
  }
}

export default function AuthCodeErrorPage() {
  return (
    <div className='flex flex-grow items-center justify-center bg-slate-50 p-4 py-4 md:py-20 dark:bg-neutral-950'>
      <div className='w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-neutral-800 dark:bg-neutral-900'>
        <h1 className='mb-4 text-2xl font-bold text-slate-800 dark:text-white'>
          Error de autenticación
        </h1>
        <p className='mb-8 leading-relaxed text-slate-500 dark:text-neutral-400'>
          Hubo un problema al procesar tu solicitud de inicio de sesión. Esto
          puede deberse a un enlace expirado o ya utilizado. Intenta iniciar
          sesión de nuevo.
        </p>
        <Link
          href='/'
          className='font-semibold text-[var(--color-dark-blue)] hover:underline'
        >
          Ir a la página principal
        </Link>
      </div>
    </div>
  )
}
