import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@lib/shared'

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  default: 'button-default',
  destructive: 'button-destructive',
  outline: 'button-outline',
  secondary: 'button-secondary',
  ghost: 'button-ghost',
  link: 'button-link',
}

const sizeClasses: Record<ButtonSize, string> = {
  default: 'button-md',
  sm: 'button-sm',
  lg: 'button-lg',
  icon: 'button-icon',
}

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
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

export { Button }
export type { ButtonVariant, ButtonSize }