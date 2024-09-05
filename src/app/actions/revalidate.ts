'use server'

import { log } from '@logtail/next'
import { revalidatePath } from 'next/cache'

export const revalidateDataPath = async (path: string) => {
  try {
    await revalidatePath(path, 'page')
    log.info(`REVALIDATION_SUCCESSFUL: ${path}`)
    return { success: true, message: `Successfully revalidated path: ${path}` }
  } catch (error) {
    log.error(`REVALIDATION_FAILED: ${path}`, { error })
    return {
      success: false,
      message: `Failed to revalidate path: ${path}`,
      error
    }
  }
}
