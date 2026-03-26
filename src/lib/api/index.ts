import { HttpClient } from '@lib/httpClient'
import { PostsClient } from './PostsClient'
import { CategoriesClient } from './CategoriesClient'
import { TagsClient } from './TagsClient'
import { AdsClient } from './AdsClient'

const httpClient = new HttpClient()

export const postsClient = new PostsClient(httpClient)
export const categoriesClient = new CategoriesClient(httpClient)
export const tagsClient = new TagsClient(httpClient)
export const adsClient = new AdsClient(httpClient)

export * from './BaseClient'
export * from './PostsClient'
export * from './CategoriesClient'
export * from './TagsClient'
export * from './AdsClient'
