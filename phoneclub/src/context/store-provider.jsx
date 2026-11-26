import { useMemo, useState } from 'react'
import { allStoreOption } from '@/data/mockData'
import { useBusinessData } from './business-context'
import { useRole } from './role-context'
import { StoreContext } from './store-context'

export function StoreProvider({ children }) {
  const { stores } = useBusinessData()
  const { userSession, accessibleStoreIds } = useRole()
  const [selection, setSelection] = useState({ session: userSession, storeId: allStoreOption.id })

  const value = useMemo(() => {
    const canSeeAllStores = accessibleStoreIds.includes('all')
    const availableStores = canSeeAllStores
      ? [allStoreOption, ...stores]
      : stores.filter((store) => accessibleStoreIds.includes(store.id))
    const options = availableStores.length ? availableStores : [allStoreOption]

    // Switching demo users resets scope: admins see All Stores, limited roles
    // start at their assigned store. Subsequent choices remain user-driven.
    const requestedStoreId =
      selection.session === userSession
        ? selection.storeId
        : canSeeAllStores
          ? allStoreOption.id
          : accessibleStoreIds[0]
    const storeId = options.some((store) => store.id === requestedStoreId)
      ? requestedStoreId
      : options[0].id

    return {
      storeId,
      setStoreId: (nextStoreId) => setSelection({ session: userSession, storeId: nextStoreId }),
      store: options.find((item) => item.id === storeId),
      stores: options,
    }
  }, [stores, accessibleStoreIds, selection, userSession])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
