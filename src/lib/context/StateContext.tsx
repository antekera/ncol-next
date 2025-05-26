'use client'

import { Dispatch, createContext, use, useCallback, useState } from 'react'

interface StateContextProps {
  preview: boolean
  isMenuActive: boolean
  today: Date
  contentHeight: number
  coverSlug: string
}

const initialContext: StateContextProps = {
  preview: false,
  isMenuActive: false,
  today: new Date(),
  contentHeight: 0,
  coverSlug: ''
}

const StateContext = createContext<
  StateContextProps & {
    handleSetContext: Dispatch<React.SetStateAction<Partial<StateContextProps>>>
  }
>({
  ...initialContext,
  handleSetContext: () => {}
})

const StateContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, setState] = useState<StateContextProps>(initialContext)

  const handleSetContext = useCallback(
    (prev: React.SetStateAction<Partial<StateContextProps>>) => {
      setState(currentState => ({
        ...currentState,
        ...(typeof prev === 'function' ? prev(currentState) : prev)
      }))
    },
    []
  )

  return (
    <StateContext.Provider value={{ ...state, handleSetContext }}>
      {children}
    </StateContext.Provider>
  )
}

export default function ContextStateData() {
  const context = use(StateContext)
  if (!context) {
    // eslint-disable-next-line no-console
    console.error('ContextStateData must be used within a StateContextProvider')
  }
  return context
}

export { ContextStateData, StateContextProvider }
