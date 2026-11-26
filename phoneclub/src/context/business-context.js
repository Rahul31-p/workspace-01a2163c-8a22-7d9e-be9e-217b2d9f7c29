import { createContext, useContext } from 'react'

export const BusinessContext = createContext(null)

export function useBusinessData() {
  const context = useContext(BusinessContext)

  if (!context) {
    throw new Error('useBusinessData must be used inside a BusinessProvider')
  }

  return context
}
