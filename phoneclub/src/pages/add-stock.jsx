import { Link } from 'react-router-dom'
import { CheckCircle2, X } from 'lucide-react'
import { AddStockForm } from '@/components/inventory/add-stock-form'
import { PageHeader } from '@/components/common/page-header'
import { PermissionNotice, UiPermissionBanner } from '@/components/common/permission-notice'
import { Button } from '@/components/ui/button'
import { useBusinessData } from '@/context/business-context'
import { useRole } from '@/context/role-context'
import { useStore } from '@/context/store-context'
import { useToast } from '@/context/toast-context'

export default function AddStockPage() {
  const { devices, stores, addDevice } = useBusinessData()
  const { storeId } = useStore()
  const { user, can } = useRole()
  const { toast } = useToast()
  const allowed = can('manageInventory')

  const handleSubmit = (values) => {
    const device = addDevice(values)

    toast({
      title: 'Mobile added to inventory',
      description: `${device.brand} ${device.model} · IMEI ${device.imei} is now in stock at its selected store.`,
      variant: 'success',
      action: { label: 'View inventory', to: '/inventory' },
    })
  }

  const scopeNote = storeId === 'all' ? null : ` New stock is locked to ${stores.find((store) => store.id === storeId)?.name ?? 'the selected store'}.`

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Stock"
        description="Add a smartphone to PHONECLUB inventory with IMEI validation and purchase details."
        actions={
          allowed ? (
            <>
              <Button variant="outline" asChild>
                <Link to="/inventory">
                  <X />
                  Cancel
                </Link>
              </Button>
              <Button type="submit" form="add-stock-form">
                <CheckCircle2 />
                Save mobile
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/inventory">
                <X />
                Back to inventory
              </Link>
            </Button>
          )
        }
      />

      <UiPermissionBanner role={user.role} />

      {!allowed ? (
        <PermissionNotice
          title="You cannot add inventory in this role"
          description={`${user.name} (${user.role.replace('_', ' ')}) can view stock, but only Super Admins and Store Managers can receive new devices into inventory.`}
        />
      ) : (
        <>
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              New devices are saved to shared inventory state. They appear immediately in the inventory table and
              update the selected store&apos;s available stock on the dashboard.{scopeNote}
            </p>
          </div>

          <AddStockForm
            devices={devices}
            onSubmit={handleSubmit}
            storeOptions={stores}
            lockedStoreId={storeId === 'all' ? null : storeId}
          />
        </>
      )}
    </div>
  )
}
