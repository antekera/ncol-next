import { splitPost } from '..'

const text =
  '<p>El exministro de Industrias Básicas y Minería y exgobernador del estado Trujillo, Hugo Cabezas</p><p> Fue detenido este martes por su presunta vinculación con los fraudes en la Corporación Venezolana de Guayana (CVG).</p>'

const post = {
  content: text,
  title: 'Lorem ipsum',
  slug: 'lorem-ipsum',
  date: '2023-04-05T17:28:55',
  categories: {
    edges: [
      {
        node: {
          name: 'Nacionales',
          uri: '/category/nacionales/',
          slug: 'nacionales'
        }
      }
    ]
  },
  uri: '/2023/'
}

describe('splitPost', () => {
  test('should split text', () => {
    expect(splitPost({ post })).toEqual([
      '<p>El exministro de Industrias Básicas y Minería y exgobernador del estado Trujillo, Hugo Cabezas</p>',
      '<p> Fue detenido este martes por su presunta vinculación con los fraudes en la Corporación Venezolana de Guayana (CVG).</p>'
    ])
  })

  test('should return argument', () => {
    post.content = ''
    expect(splitPost({ post })).toEqual(post)
  })
})
