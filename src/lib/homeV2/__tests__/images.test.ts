import { getHomeImage } from '../images'

const image = {
  node: {
    sourceUrl: 'https://cdn.noticiascol.com/news.jpg',
    srcSet:
      'https://cdn.noticiascol.com/news-175.jpg 175w, https://cdn.noticiascol.com/news-660.jpg 660w, https://cdn.noticiascol.com/news-1134.jpg 1134w'
  }
}
it('uses an appropriate WordPress derivative and retains responsive candidates', () => {
  expect(getHomeImage(image, 400)).toEqual({
    src: 'https://cdn.noticiascol.com/news-660.jpg',
    srcSet: image.node.srcSet
  })
  expect(getHomeImage(image, 90)?.src).toBe(
    'https://cdn.noticiascol.com/news-175.jpg'
  )
  expect(getHomeImage(image, 2000)?.src).toBe(
    'https://cdn.noticiascol.com/news-1134.jpg'
  )
})
it('ignores invalid, credential-bearing and unrelated srcset sources', () => {
  const unsafe = {
    node: {
      sourceUrl: image.node.sourceUrl,
      srcSet:
        'https://evil.test/track.jpg 640w, https://user:pass@cdn.noticiascol.com/private.jpg 200w, broken 1w'
    }
  }
  expect(getHomeImage(unsafe, 400)).toEqual({
    src: image.node.sourceUrl,
    srcSet: undefined
  })
  expect(getHomeImage(null, 400)).toBeNull()
  expect(
    getHomeImage({ node: { sourceUrl: 'data:image/png,abc' } }, 400)
  ).toBeNull()
})

it('uses the verified large original when only small derivatives exist', () => {
  expect(
    getHomeImage(
      {
        node: {
          ...image.node,
          mediaDetails: { width: 1600, height: 900 }
        }
      },
      1600
    )?.src
  ).toBe(image.node.sourceUrl)
})
