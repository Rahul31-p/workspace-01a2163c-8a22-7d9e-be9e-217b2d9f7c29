import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PermissionNotice, UiPermissionBanner } from '@/components/common/permission-notice'
import { TransferFormCard } from '@/components/transfers/transfer-form-card'
import { TransferHistoryCard } from '@/components/transfers/transfer-history-card'
import { TransferOverview } from '@/components/transfers/transfer-overview'
import { Button } from '@/components/ui/button'
import { useBusinessData } from '@/context/business-context'
import { useRole } from '@/context/role-context'
import { useStore } from '@/context/store-context'
import { useToast } from '@/context/toast-context'
import { allStoreOption } from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import {
  getTransferOverview,
  getTransferValidation,
  transferScoped,
} from '@/data/transferSelectors'

export default function TransfersPage() {
  const { storeId } = useStore()
  const { stores, devices, transferRecords, transferDevice } = useBusinessData()
  const { user, can } = useRole()
  const { toast } = useToast()

  const canTransfer = can('transferStock')
  const scopedDevices = useMemo(
    () => devices.filter((device) => storeId === 'all' || device.storeId === storeId),
    [devices, storeId],
  )
  const scopedTransfers = useMemo(() => transferScoped(transferRecords, storeId), [transferRecords, storeId])
  const metrics = getTransferOverview(transferRecords, storeId)
  const scopeName = storeId === 'all' ? allStoreOption.name : getStoreName(storeId, stores)

  const handleSubmit = (deviceId, values) => {
    const device = devices.find((item) => item.id === deviceId)
    const validation = getTransferValidation(device, values.toStoreId, stores)

    if (validation) {
      toast({ title: 'Transfer not completed', description: validation, variant: 'error' })
      return { ok: false, message: validation }
    }

    const transfer = transferDevice(deviceId, values)

    if (!transfer) {
      const message = 'This mobile is no longer transferable. Refresh the selection and try again.'
      toast({ title: 'Transfer not completed', description: message, variant: 'error' })
      return { ok: false, message }
    }

    toast({
      title: 'Transfer completed',
      description: `${transfer.brand} ${transfer.model} · ${transfer.id} moved to ${getStoreName(transfer.toStoreId, stores)}.`,
      variant: 'success',
      action: { label: 'View history', to: '/transfers#transfer-history' },
    })

    return { ok: true, transfer }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Transfers"
        description={`Move individual mobiles between PHONECLUB stores in ${scopeName}.`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/inventory">
              Mobile inventory
              <ArrowUpRight />
            </Link>
          </Button>
        }
      />

      <UiPermissionBanner role={user.role} />

      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Transfers update one existing inventory record only. IMEI and purchase details are preserved, sold devices are
          blocked, and every movement is added to shared history and store counts.
        </p>
      </div>

      <TransferOverview metrics={metrics} />

      {canTransfer ? (
        <TransferFormCard devices={scopedDevices} stores={stores} onSubmit={handleSubmit} />
      ) : (
        <PermissionNotice
          title="Transfers are disabled for this role"
          description={`${user.name} can review transfer history, but this mock role is not permitted to move stock between stores.`}
        />
      )}

      <div id="transfer-history" className="scroll-mt-24">
        <TransferHistoryCard
          transfers={scopedTransfers}
          storeOptions={stores}
          lockedStoreId={storeId === 'all' ? null : storeId}
        />
      </div>
    </div>
  )
}
