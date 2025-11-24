'use client'

import Link from 'next/link'
import { useState, ComponentProps } from 'react'

export function HoverPrefetchLink({
    children,
    ...props
}: ComponentProps<typeof Link>) {
    const [active, setActive] = useState(false)

    return (
        <Link
            {...props}
            prefetch={active ? null : false}
            onMouseEnter={(e) => {
                setActive(true)
                props.onMouseEnter?.(e)
            }}
        >
            {children}
        </Link>
    )
}
