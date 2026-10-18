import type { Meta, StoryObj } from '@storybook/react'
import type { HomeArticle } from '@lib/homeV2/types'
import { Opening } from './Opening'
import styles from './HomeV2.module.css'

const featured: HomeArticle = {
  id: 'story-featured',
  uri: '/categoria/zulia/',
  title: 'Zulia impulsa nuevos proyectos para mejorar la infraestructura vial',
  excerpt:
    'Las autoridades regionales anuncian un plan de rehabilitación de las principales vías del estado.',
  date: '2026-10-17T12:00:00',
  categories: { edges: [{ node: { name: 'Zulia', slug: 'zulia' } }] },
  featuredImage: {
    node: {
      sourceUrl:
        'https://cdn.noticiascol.com/wp-content/uploads/2026/10/18073943/def89c82-283b-4fc5-afb5-6407c99c0a9c.jpeg',
      mediaDetails: { width: 1280, height: 960 }
    }
  }
}
const meta = {
  title: 'Home V2/Apertura',
  component: Opening,
  decorators: [
    Story => (
      <div className={styles.home}>
        <Story />
      </div>
    )
  ],
  parameters: { layout: 'fullscreen' },
  args: {
    featured,
    secondary: [
      {
        ...featured,
        id: 'secondary-1',
        uri: '/categoria/nacionales/',
        title: 'La agenda nacional y regional, en una portada compartida'
      }
    ]
  }
} satisfies Meta<typeof Opening>
export default meta
type Story = StoryObj<typeof meta>
export const Fotografica: Story = {}
export const Tradicional: Story = {
  args: {
    featured: {
      ...featured,
      featuredImage: {
        node: {
          sourceUrl:
            'https://cdn.noticiascol.com/wp-content/uploads/2026/10/18082848/IMG_1085.webp',
          mediaDetails: { width: 1024, height: 576 }
        }
      }
    }
  }
}
export const SinImagen: Story = {
  args: { featured: { ...featured, featuredImage: null } }
}
export const SinContenido: Story = { args: { featured: null, secondary: [] } }
