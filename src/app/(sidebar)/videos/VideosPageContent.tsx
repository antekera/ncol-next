'use client'

import { useVideoPosts } from '@lib/hooks/data/useVideoPosts'
import { VideoCard } from '@components/VideoCard'

export function VideosPageContent() {
  const { posts, isLoading, error } = useVideoPosts({ filterByDate: false })

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className='animate-pulse space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4'
          >
            <div className='aspect-video w-full rounded bg-slate-800' />
            <div className='space-y-2'>
              <div className='h-3 w-16 rounded bg-slate-800' />
              <div className='h-4 w-3/4 rounded bg-slate-800' />
              <div className='h-4 w-1/2 rounded bg-slate-800' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='py-8 text-center text-red-500'>
        Hubo un error cargando los videos. Por favor, intente de nuevo.
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className='py-12 text-center text-slate-400'>
        No se encontraron videos recientes.
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {posts.map(post => (
        <VideoCard key={post.id} node={post} className='w-full' />
      ))}
    </div>
  )
}
