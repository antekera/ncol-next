export default function Loading() {
  return (
    <main className='min-h-screen bg-muted/20 px-4 py-10 md:py-16'>
      <div className='mx-auto max-w-3xl animate-pulse space-y-6 rounded-xl border bg-background p-5 shadow-sm md:p-8'>
        <div className='h-4 w-20 rounded bg-muted' />
        <div className='h-10 w-2/3 rounded bg-muted' />
        <div className='h-11 rounded bg-muted' />
        <div className='h-80 rounded bg-muted' />
        <div className='h-24 rounded bg-muted' />
        <div className='h-10 rounded bg-muted' />
      </div>
    </main>
  )
}
