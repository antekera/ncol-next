import { createState, useState } from '@hookstate/core'

interface Props {
  headerType?: string
  preview?: boolean
  isLoading?: boolean
}

const initialState = {
  headerType: 'main',
  preview: false,
  isLoading: false,
  isMenuActive: false,
}

const pageState = createState(initialState)

export const setPageState = (props: Props) => {
  pageState.set({
    ...initialState,
    ...props,
  })
}

export const usePageState = () => {
  return useState(pageState)
}
