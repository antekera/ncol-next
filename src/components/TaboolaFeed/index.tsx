'use client'

import TaboolaComponent from '@taboola/taboola-react-web'

const TaboolaFeed = ({ slug }: { slug: string }) => {
  return (
    <TaboolaComponent
      canonicalUrl={slug}
      publisherId='noticiascol-noticiascol'
      pageType='article'
      mode='thumbnails-a'
      containerId='taboola-below-article-thumbnails'
      placement='Below Article Thumbnails'
      targetType='mix'
    />
  )
}

export { TaboolaFeed }
