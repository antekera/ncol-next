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
        // border must be forced with `!` to actually render. A gray fill
        // is also needed since Tailwind's preflight resets buttons to a
        // transparent background, which made the box invisible on white.
        'peer focus-visible:ring-ring/50 size-4 shrink-0 rounded-[4px] !border !border-slate-400 !bg-slate-100 shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:!border-[var(--color-dark-blue)] data-[state=checked]:!bg-[var(--color-dark-blue)] data-[state=checked]:text-white dark:!border-neutral-500 dark:!bg-neutral-700',
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
