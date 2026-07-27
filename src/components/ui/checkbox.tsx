'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

import { cn } from '@lib/shared'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        // Global `button { border-none }` in src/styles/index.css sits
        // outside any Tailwind @layer, so it beats layered border
        // utilities on this Radix button regardless of specificity —
        // border must be forced with `!` to actually render.
        'peer !border size-4 shrink-0 rounded-[4px] !border-slate-300 shadow-xs outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:!border-[var(--color-dark-blue)] data-[state=checked]:bg-[var(--color-dark-blue)] data-[state=checked]:text-white dark:!border-neutral-600 dark:bg-neutral-800',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='grid place-content-center text-current transition-none'
      >
        <Check className='size-3.5' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
