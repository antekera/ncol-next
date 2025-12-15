export enum HeaderType {
  Main = 'main',
  Category = 'category',
  Single = 'single',
  Share = 'share',
  Primary = 'primary'
}

export type HeaderProps = {
  title?: string
  className?: string
  headerType?: string
  uri?: string
}
