import OpinionPublishForm from '@components/opinion/OpinionPublishForm'

type Props = {
  params: Promise<{ token: string }>
}

export default async function OpinionPublishPage({ params }: Props) {
  const { token } = await params

  return (
    <main className='min-h-screen bg-muted/20 px-4 py-10 md:py-16'>
      <OpinionPublishForm token={token} />
    </main>
  )
}
