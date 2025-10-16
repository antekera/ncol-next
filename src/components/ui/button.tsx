import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@lib/shared'
import './button.css'

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot='button'
      className={cn(
        'button',
        `button-${variant}`,
        `button-${size}`,
        className
      )}
      {...props}
    />
  )
}

export { Button }
export type { ButtonVariant, ButtonSize }