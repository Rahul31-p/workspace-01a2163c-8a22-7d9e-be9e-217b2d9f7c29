import { useCallback, useMemo, useState } from 'react'
import { canUser } from '@/data/permissions'
import { useBusinessData } from './business-context'
import { RoleContext } from './role-context'

export function RoleProvider({ children }) {
  const { users } = useBusinessData()
  const [selectedUserId, setSelectedUserId] = useState(users[0].id)
  const [switchCount, setSwitchCount] = useState(0)

  const selectUser = useCallback(
    (nextUserId) => {
      const nextUser = users.find((user) => user.id === nextUserId)
      if (!nextUser || nextUser.status !== 'Active') return
      setSelectedUserId(nextUserId)
      setSwitchCount((count) => count + 1)
    },
    [users],
  )

  const value = useMemo(() => {
    const activeUsers = users.filter((user) => user.status === 'Active')
    const user =
      activeUsers.find((item) => item.id === selectedUserId) ?? activeUsers[0] ?? users[0]

    return {
      user,
      users,
      activeUsers,
      selectUser,
      userSession: `${user.id}-${switchCount}`,
      can: (capability) => canUser(user, capability),
      accessibleStoreIds: user.role === 'super_admin' ? ['all'] : [user.storeId],
    }
  }, [users, selectedUserId, switchCount, selectUser])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}
