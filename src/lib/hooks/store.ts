import create from 'zustand'

/**
 * State for page setup
 */

interface PageSetupStateProps {
  headerType?: string
  preview?: boolean
  isLoading?: boolean
}

interface PageSetupState extends PageSetupStateProps {
  setPageSetupState: (props: PageSetupStateProps) => void
}

const usePageStore = create<PageSetupState>(set => ({
  headerType: 'main',
  preview: false,
  isLoading: false,
  isMenuActive: false,
  bears: 0,
  setPageSetupState: props => set(state => ({ ...state, ...props })),
}))

/**
 * Exports
 */

export { usePageStore }
