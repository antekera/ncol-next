import { useCallback } from 'react'
import { FILTERED_CATEGORIES, DOLAR_HOY_SLUG } from '@lib/constants'

const STORAGE_KEY = 'user_visited_categories'

const IGNORED_CATEGORIES = [...FILTERED_CATEGORIES, DOLAR_HOY_SLUG]

export function useUserCategories() {
    const trackCategory = useCallback((slug: string) => {
        if (typeof window === 'undefined' || !slug) return
        if (IGNORED_CATEGORIES.includes(slug)) return

        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            const categories: Record<string, number> = stored ? JSON.parse(stored) : {}

            // Increment count
            // eslint-disable-next-line security/detect-object-injection
            categories[slug] = (categories[slug] || 0) + 1

            localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error saving user categories', e)
        }
    }, [])

    const getMostVisitedCategory = useCallback((): string | null => {
        if (typeof window === 'undefined') return null

        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (!stored) return null

            const categories: Record<string, number> = JSON.parse(stored)

            let topCategory: string | null = null
            let maxCount = 0

            for (const [slug, count] of Object.entries(categories)) {
                if (count > maxCount && !IGNORED_CATEGORIES.includes(slug)) {
                    maxCount = count
                    topCategory = slug
                }
            }

            return topCategory
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error reading user categories', e)
            return null
        }
    }, [])

    return { trackCategory, getMostVisitedCategory }
}
