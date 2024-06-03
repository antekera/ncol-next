'use server'

import { log } from '@logtail/next'
import { revalidatePath } from 'next/cache'

export const revalidateDataPath = async (path: string) => {
  log.info(`Revalidating path: ${path}`)
  revalidatePath(path, 'page')
}
