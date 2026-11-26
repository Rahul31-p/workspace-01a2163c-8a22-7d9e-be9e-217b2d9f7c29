import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PermissionNotice, UiPermissionBanner } from '@/components/common/permission-notice'
import { RecordSaleCard } from '@/components/sales/record-sale-card'
import { SalesHistoryCard } from '@/components/sales/sales-history-card'
import { SalesOverview } from '@/components/sales/sales-overview'
import { Button } from '@/components/ui/button'
import { useBusinessData } from '@/context/business-context'
import { useRole } from '@/context/role-context'
import { useStore } from '@/context/store-context'
import { useToast } from '@/context/toast-context'
import { allStoreOption } from '@/data/mockData'
import { getSalesOverview } from '@/data/salesSelectors'
import { getStoreName, matchesStore } from '@/data/selectors'

export default function SalesPage() {
  const { storeId } = useStore()
  const { devices: allDevices, stores, salesRecords: sales, recordSale } = useBusinessData()
  const { user, can } = useRole()
  const { toast } = useToast()

  const devices = useMemo(
    () => allDevices.filter((device) => matchesStore(device, storeId)),
    [allDevices, storeId],
  )
  const metrics = getSalesOverview(sales, storeId)
  const scopeName = storeId === 'all' ? allStoreOption.name : getStoreName(storeId, stores)
  const availableDevices = devices.filter((device) => device.status !== 'Sold')
  const canRecord = can('recordSales')

  const handleSubmit = (deviceId, values) => {
    const sale = recordSale(deviceId, values)

    if (!sale) {
      toast({
        title: 'Sale not recorded',
        description: 'This mobile is already sold or is no longer available.',
        variant: 'error',
      })
      return null
    }

    toast({
      title: 'Sale recorded successfully',
      description: `${sale.invoiceNumber} · ${sale.brand} ${sale.model} marked as Sold.`,
      variant: 'success',
      action: { label: 'View history', to: '/sales#sales-history' },
    })

    return sale
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Management"
        description={`Record sales, track profit and review transactions for ${scopeName}.`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/inventory">
              Available stock
              <ArrowUpRight />
            </Link>
          </Button>
        }
      />

      <UiPermissionBanner role={user.role} />

      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
        <ShoppingCart className="h-4 w-4 shrink-0 text-primary" />
        <span>
          All figures use the same shared records as the dashboard and inventory.{' '}
          <strong className="font-semibold text-foreground">{availableDevices.length}</strong> mobile
          {availableDevices.length === 1 ? '' : 's'} in this scope are eligible for sale.
        </span>
      </div>

      <SalesOverview metrics={metrics} />

      {canRecord ? (
        <RecordSaleCard devices={devices} onSubmit={handleSubmit} storeOptions={stores} />
      ) : (
        <PermissionNotice
          compact
          title="Recording sales is disabled for this demo user"
          description={`${user.name} can review sales history, but this mock role is not permitted to create a sale.`}
        />
      )}

      <div id="sales-history" className="scroll-mt-24">
        <SalesHistoryCard
          sales={sales}
          storeOptions={stores}
          lockedStoreId={storeId === 'all' ? null : storeId}
        />
      </div>
    </div>
  )
}
