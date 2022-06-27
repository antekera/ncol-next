import create from 'zustand'

import { Category } from 'lib/types'

/**
 * State for page setup
 */

interface PageSetupStateProps {
  headerType?: string
  preview?: boolean
  isLoading?: boolean
  isMenuActive?: boolean
  currentCategory?: Category
}

interface PageSetupState extends PageSetupStateProps {
  setPageSetupState: (props: PageSetupStateProps) => void
}

const usePageStore = create<PageSetupState>(set => ({
  headerType: 'main',
  preview: false,
  isLoading: false,
  isMenuActive: false,
  setPageSetupState: props => set(state => ({ ...state, ...props })),
}))

/**
 * Exports
 */

export { usePageStore }
