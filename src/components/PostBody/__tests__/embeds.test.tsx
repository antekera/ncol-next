import { render, screen } from '@testing-library/react'
import { PostBody } from '..'

jest.mock('@components/AdSenseBanner', () => ({ AdSenseBanner: () => <div /> }))

describe('PostBody embeds', () => {
  test('renders Instagram embed iframe for instagram blockquote', () => {
    const html =
      '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/abc123/"></blockquote>'
    render(<PostBody firstParagraph={html} secondParagraph='' />)
    expect(screen.getByTitle('Instagram')).toBeInTheDocument()
  })

  test('renders X(Twitter) embed for twitter blockquote', () => {
    const html =
      '<blockquote class="twitter-tweet"><a href="https://x.com/status/1"></a></blockquote>'
    render(<PostBody firstParagraph='' secondParagraph={html} />)
    // XEmbed renders a div; assert presence by structure count
    expect(document.querySelectorAll('.mx-auto.my-6').length).toBeGreaterThan(0)
  })

  test('renders TikTok embed for tiktok blockquote', () => {
    const html =
      '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@u/video/1">content</blockquote>'
    render(<PostBody firstParagraph={html} secondParagraph='' />)
    expect(document.querySelectorAll('.mx-auto.my-6').length).toBeGreaterThan(0)
  })

  test('renders YouTube embed for iframe src', () => {
    const html = '<iframe src="https://www.youtube.com/embed/VIDEOID"></iframe>'
    render(<PostBody firstParagraph='' secondParagraph={html} />)
    // YouTubeEmbed injects an element; assert presence by class
    expect(
      document.querySelector('[class*="aspect-video"]').parentElement
    ).toBeTruthy()
  })

  test('falls back to raw HTML when no embeds', () => {
    const html = '<p>Hello world</p>'
    render(<PostBody firstParagraph={html} secondParagraph='' />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })
})
