import { Suspense } from 'react'
import DenunciaForm from '@components/DenunciaForm'
import { Header } from '@components/Header'
import { MobileRankingLinks } from '@components/MobileRankingLinks'

export const metadata = {
  title: 'Realizar una Denuncia | Noticiascol',
  description:
    'Reporta situaciones irregulares en tu comunidad. Tu voz cuenta en Noticiascol.'
}

export default function DenunciasPage() {
  return (
    <>
      <Header />
      <MobileRankingLinks />
      <div className='container mx-auto px-4 py-8 font-sans md:py-12'>
        <div className='mx-auto max-w-3xl space-y-8'>
          <div className='space-y-4 text-center'>
            <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>
              Canal de Denuncias
            </h1>
            <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
              Este espacio está dedicado a la comunidad. Aquí puedes reportar
              botes de agua, fallas eléctricas, estado de las vías o cualquier
              situación que afecte tu sector y será publicado en Noticiascol.
            </p>
            <div className='mx-auto max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200'>
              <strong>Nota Importante:</strong> Nos tomamos en serio cada
              reporte. El equipo de Noticiascol verificará la información antes
              de su publicación. Tus datos de contacto se mantendrán
              estrictamente confidenciales.
            </div>
          </div>

          <Suspense
            fallback={
              <div className='py-10 text-center'>Cargando formulario...</div>
            }
          >
            <DenunciaForm />
          </Suspense>
        </div>
      </div>
    </>
  )
}
