export default function PostTitle({ children }) {
  return (
    <h1
      className='mb-12 text-6xl leading-tight tracking-tighter text-center font-sans_medium md:text-7xl lg:text-8xl md:leading-none md:text-left'
      dangerouslySetInnerHTML={{ __html: children }}
    />
  )
}
