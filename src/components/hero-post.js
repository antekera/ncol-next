import { Date, CoverImage } from 'components'
import Link from 'next/link'

export default function HeroPost({ title, coverImage, date, excerpt, uri }) {
  return (
    <section>
      <div className='mb-8 md:mb-16'>
        {coverImage && (
          <CoverImage title={title} coverImage={coverImage} uri={uri} />
        )}
      </div>
      <div className='mb-20 md:grid md:grid-cols-2 md:col-gap-16 lg:col-gap-8 md:mb-28'>
        <div>
          <h3 className='mb-4 text-4xl leading-tight lg:text-6xl'>
            <Link href={`${uri}`}>
              <a
                className='hover:underline'
                dangerouslySetInnerHTML={{ __html: title }}
              />
            </Link>
          </h3>
          <div className='mb-4 text-lg md:mb-0'>
            <Date dateString={date} />
          </div>
        </div>
        <div>
          <div
            className='mb-4 text-lg leading-relaxed'
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        </div>
      </div>
    </section>
  )
}
