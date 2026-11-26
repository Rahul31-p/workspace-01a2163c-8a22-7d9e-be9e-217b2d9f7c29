import { useMemo, useState } from 'react'
import { Building2, CircleCheck, Plus, UsersRound, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PermissionNotice, UiPermissionBanner } from '@/components/common/permission-notice'
import { StatCard } from '@/components/common/stat-card'
import { RolePermissionsCard } from '@/components/stores/role-permissions-card'
import { StoreCard } from '@/components/stores/store-card'
import { StoreDetailsModal } from '@/components/stores/store-details-modal'
import { StoreFormModal } from '@/components/stores/store-form-modal'
import { Button } from '@/components/ui/button'
import { useBusinessData } from '@/context/business-context'
import { useRole } from '@/context/role-context'
import { useStore } from '@/context/store-context'
import { useToast } from '@/context/toast-context'
import { getStoreOverview } from '@/data/storeSelectors'
import { formatCurrency, formatNumber } from '@/lib/format'

export default function StoresPage() {
  const { stores, users, devices, salesRecords, addStore, updateStore, toggleStoreStatus } = useBusinessData()
  const { storeId, setStoreId } = useStore()
  const { user, can } = useRole()
  const { toast } = useToast()
  const [modal, setModal] = useState(null)

  const visibleStores = useMemo(
    () => (storeId === 'all' ? stores : stores.filter((store) => store.id === storeId)),
    [stores, storeId],
  )

  const overviews = useMemo(
    () =>
      Object.fromEntries(
        visibleStores.map((store) => [
          store.id,
          getStoreOverview({ store, devices, sales: salesRecords, users }),
        ]),
      ),
    [visibleStores, devices, salesRecords, users],
  )

  const selectedStore = modal?.storeId ? stores.find((store) => store.id === modal.storeId) : null
  const selectedOverview = selectedStore
    ? getStoreOverview({ store: selectedStore, devices, sales: salesRecords, users })
    : null

  const totals = visibleStores.reduce(
    (accumulator, store) => {
      const overview = overviews[store.id]
      accumulator.active += store.status === 'Active' ? 1 : 0
      accumulator.employees += overview.employees.length
      accumulator.revenue += overview.revenue
      return accumulator
    },
    { active: 0, employees: 0, revenue: 0 },
  )

  const closeModal = () => setModal(null)

  function handleFormSubmit(values) {
    if (modal?.type === 'edit' && selectedStore) {
      const updated = updateStore(selectedStore.id, values)
      toast({
        title: 'Store updated',
        description: `${updated.name} details are now current across the app.`,
        variant: 'success',
      })
    } else {
      const created = addStore(values)
      toast({
        title: 'Store added',
        description: `${created.name} · ${created.code} is available in the store selector.`,
        variant: 'success',
      })
    }
    closeModal()
  }

  function handleToggle(store) {
    const updated = toggleStoreStatus(store.id)
    toast({
      title: updated.status === 'Active' ? 'Store activated' : 'Store deactivated',
      description: `${updated.name} is now ${updated.status.toLowerCase()}.`,
      variant: updated.status === 'Active' ? 'success' : 'warning',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Management"
        description={`Manage ${stores.length} PHONECLUB location${stores.length === 1 ? '' : 's'} from one dashboard.`}
        actions={
          can('manageStores') ? (
            <Button onClick={() => setModal({ type: 'add' })}>
              <Plus />
              Add store
            </Button>
          ) : undefined
        }
      />

      <UiPermissionBanner role={user.role} />

      {!can('manageStores') && (
        <PermissionNotice
          compact
          title="Read-only store view"
          description={`${user.name} can review assigned store details and reports, but only a Super Admin can add, edit or deactivate stores.`}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Locations shown"
          value={formatNumber(visibleStores.length)}
          icon={Building2}
          footnote={storeId === 'all' ? 'All store records' : 'Filtered by global store selector'}
        />
        <StatCard title="Active stores" value={formatNumber(totals.active)} icon={CircleCheck} tone="success" footnote="Currently operating" />
        <StatCard title="Assigned employees" value={formatNumber(totals.employees)} icon={UsersRound} tone="warning" footnote="Mock users in view" />
        <StatCard title="Combined revenue" value={formatCurrency(totals.revenue)} icon={Wallet} footnote="From shared sales records" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Store directory</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Overview values are derived from the same inventory and sales records used elsewhere.
          </p>
        </div>
        {storeId !== 'all' && can('viewAllStores') && (
          <Button variant="outline" size="sm" onClick={() => setStoreId('all')}>
            View all stores
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            overview={overviews[store.id]}
            canManage={can('manageStores')}
            onView={() => setModal({ type: 'view', storeId: store.id })}
            onEdit={() => setModal({ type: 'edit', storeId: store.id })}
            onToggle={() => handleToggle(store)}
          />
        ))}
      </div>

      <RolePermissionsCard />

      {modal?.type === 'add' && (
        <StoreFormModal
          open
          onOpenChange={(open) => !open && closeModal()}
          stores={stores}
          onSubmit={handleFormSubmit}
        />
      )}

      {modal?.type === 'edit' && selectedStore && (
        <StoreFormModal
          open
          onOpenChange={(open) => !open && closeModal()}
          store={selectedStore}
          stores={stores}
          onSubmit={handleFormSubmit}
        />
      )}

      {modal?.type === 'view' && selectedStore && (
        <StoreDetailsModal
          open
          onOpenChange={(open) => !open && closeModal()}
          store={selectedStore}
          overview={selectedOverview}
          canManage={can('manageStores')}
          onEdit={() => setModal({ type: 'edit', storeId: selectedStore.id })}
          onToggle={() => handleToggle(selectedStore)}
        />
      )}
    </div>
  )
}
