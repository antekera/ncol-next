export default function Loading() {
  return (
    <main className='bg-muted/20 min-h-screen px-4 py-10 md:py-16'>
      <div className='bg-background mx-auto max-w-3xl animate-pulse space-y-6 rounded-xl border p-5 shadow-sm md:p-8'>
        <div className='bg-muted h-4 w-20 rounded' />
        <div className='bg-muted h-10 w-2/3 rounded' />
        <div className='bg-muted h-11 rounded' />
        <div className='bg-muted h-80 rounded' />
        <div className='bg-muted h-24 rounded' />
        <div className='bg-muted h-10 rounded' />
      </div>
    </main>
  )
}
