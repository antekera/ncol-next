import { Container } from '@components/Container'
import { TagCloud } from '@components/TagCloud'
import { seoStaticData } from '@lib/generated/seoStaticData'

const FooterTagCloud = () => {
  if (!seoStaticData.nationalTags.length) return null

  return (
    <div className='py-8'>
      <Container>
        <TagCloud title='Temas de interés' />
      </Container>
    </div>
  )
}

export { FooterTagCloud }
