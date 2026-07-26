'use client'

import { Button } from '@components/ui/button'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className='flex min-h-screen items-center justify-center px-4'>
      <div className='max-w-md space-y-4 text-center'>
        <h1 className='text-2xl font-bold'>No pudimos cargar el editor</h1>
        <p className='text-muted-foreground'>Intenta nuevamente. Si el problema continúa, comunícate con NoticiasCol.</p>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </main>
  )
}
