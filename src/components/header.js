import Link from 'next/link'

export default function Header() {
  return (
    <h2 className='bg-primary mt-8 mb-20 text-2xl font-bold'>
      <Link href='/'>
        <a className='hover:underline'>Blog</a>
      </Link>
      .
    </h2>
  )
}
