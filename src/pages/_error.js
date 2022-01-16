import Link from 'next/link'

export default function ErrorPage() {
  return (
    <>
      <h1>ErrorPage - Page Not Found</h1>
      <Link href='/'>
        <a>Go back home</a>
      </Link>
    </>
  )
}
