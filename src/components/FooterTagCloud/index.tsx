import { Container } from '@components/Container'
import { TagCloud } from '@components/TagCloud'
import { seoStaticData } from '@lib/generated/seoStaticData'

const FooterTagCloud = () => {
  if (!seoStaticData.nationalTags.length) return null

  return (
    <div className='bg-white py-10 dark:bg-neutral-950'>
      <Container>
        <div className='rounded-3xl border border-slate-200 bg-slate-50/90 p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80'>
          <TagCloud title='Temas de interés' />
        </div>
      </Container>
    </div>
  )
}

export { FooterTagCloud }
