/* eslint-disable jsx-a11y/anchor-is-valid */
import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <>
      <h1>404 - Page Not Found</h1>
      <Link href='/'>
        <a>Go back home</a>
      </Link>
    </>
  )
}
