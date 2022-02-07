import { Date, CoverImage } from 'components'
import Link from 'next/link'

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  uri,
}) {
  return (
    <div>
      <div className='mb-5'>
        {coverImage && (
          <CoverImage title={title} coverImage={coverImage} uri={uri} />
        )}
      </div>
      <h3 className='mb-3 text-3xl leading-snug'>
        <Link href={`${uri}`}>
          <a
            className='hover:underline'
            dangerouslySetInnerHTML={{ __html: title }}
          ></a>
        </Link>
      </h3>
      <div className='mb-4 text-lg'>
        <Date dateString={date} />
      </div>
      <div
        className='mb-4 text-lg leading-relaxed'
        dangerouslySetInnerHTML={{ __html: excerpt }}
      />
    </div>
  )
}
