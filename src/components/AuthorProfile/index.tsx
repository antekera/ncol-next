import Image from 'next/image'
import Link from 'next/link'

type Props = {
  name: string
  slug?: string
  uri?: string
  description?: string
  avatarUrl?: string
}

export function AuthorProfile({
  name,
  slug,
  uri,
  description,
  avatarUrl
}: Props) {
  const profileHref = uri ?? (slug ? `/autor/${slug}/` : null)

  const photo = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={name}
      width={72}
      height={72}
      className='size-[72px] rounded-full object-cover grayscale'
    />
  ) : (
    <span className='flex size-[72px] items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-500 dark:bg-neutral-700 dark:text-neutral-300'>
      {name.charAt(0).toUpperCase()}
    </span>
  )

  return (
    <div className='my-8 flex items-start gap-4 rounded-xl border border-slate-200 p-5 dark:border-neutral-700'>
      {profileHref ? (
        <Link href={profileHref} className='shrink-0'>
          {photo}
        </Link>
      ) : (
        <div className='shrink-0'>{photo}</div>
      )}
      <div className='min-w-0'>
        <p className='text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-neutral-500'>
          Sobre el autor
        </p>
        {profileHref ? (
          <Link
            href={profileHref}
            className='mt-0.5 block font-bold text-slate-800 hover:underline dark:text-slate-100'
          >
            {name}
          </Link>
        ) : (
          <p className='mt-0.5 font-bold text-slate-800 dark:text-slate-100'>
            {name}
          </p>
        )}
        {description && (
          <p className='mt-2 line-clamp-3 text-sm text-slate-500 dark:text-neutral-400'>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
