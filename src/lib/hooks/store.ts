import create from 'zustand'

import { Category } from '@lib/types'

/**
 * State for page setup
 */

interface PageSetupStateProps {
  preview?: boolean
  isLoading?: boolean
  isMenuActive?: boolean
  currentCategory?: Category
  today?: Date
}

interface PageSetupState extends PageSetupStateProps {
  setPageSetupState: (props: PageSetupStateProps) => void
}

const usePageStore = create<PageSetupState>(set => ({
  preview: false,
  isLoading: false,
  isMenuActive: false,
  today: new Date(),
  setPageSetupState: props => set(state => ({ ...state, ...props })),
}))

/**
 * Exports
 */

export { usePageStore }
