import { create } from 'zustand'

import { Category } from '@lib/types'

/**
 * State for page setup
 */

interface PageSetupStateProps {
  preview?: boolean
  isMenuActive?: boolean
  currentCategory?: Category
  today?: Date
  contentHeight?: number
}

interface PageSetupState extends PageSetupStateProps {
  setPageSetupState: (props: PageSetupStateProps) => void
}

const usePageStore = create<PageSetupState>(set => ({
  preview: false,
  isMenuActive: false,
  today: new Date(),
  contentHeight: 0,
  setPageSetupState: props => set(state => ({ ...state, ...props }))
}))

/**
 * Exports
 */

export { usePageStore }
