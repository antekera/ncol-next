import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { User as UserIcon } from 'lucide-react'
import { createClient } from '@lib/supabase/server'
import { LogoutButton } from '@components/auth/LogoutButton'

export const metadata: Metadata = {
  title: 'Mi perfil',
  robots: {
    index: false,
    follow: false
  }
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const fullName = user.user_metadata?.full_name as string | undefined
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('es-VE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : undefined

  return (
    <div className='mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900'>
      <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-dark-blue)] text-white'>
        <UserIcon className='h-9 w-9' />
      </div>

      <h1 className='mb-1 text-xl font-bold text-slate-800 dark:text-white'>
        {fullName ?? user.email}
      </h1>
      {fullName && (
        <p className='mb-4 text-sm text-slate-500 dark:text-neutral-400'>
          {user.email}
        </p>
      )}
      {memberSince && (
        <p className='mb-8 text-xs text-slate-400 dark:text-neutral-500'>
          Miembro desde el {memberSince}
        </p>
      )}

      <LogoutButton />
    </div>
  )
}
