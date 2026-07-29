'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@components/ui/button'
import { createClient } from '@lib/supabase/client'
import { unbindOneSignalUser } from '@lib/oneSignalWeb'

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    unbindOneSignalUser()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button
      type='button'
      variant='destructive'
      disabled={isLoading}
      onClick={() => {
        void handleLogout()
      }}
      className='gap-2'
    >
      <LogOut className='h-4 w-4' />
      Cerrar sesión
    </Button>
  )
}
