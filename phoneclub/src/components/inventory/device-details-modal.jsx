import { BrandIcon } from '@/components/inventory/brand-icon'
import { StockStatusBadge } from '@/components/inventory/stock-status-badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { stores as seedStores } from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import { formatCurrency } from '@/lib/format'

function Detail({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={`mt-1 text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

export function DeviceDetailsModal({
  open,
  onOpenChange,
  device,
  historyCount = 0,
  onViewHistory,
  storeOptions = seedStores,
}) {
  if (!device) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <BrandIcon brand={device.brand} className="h-11 w-11" />
            <div>
              <DialogTitle>
                {device.brand} {device.model}
              </DialogTitle>
              <DialogDescription>
                {device.storage} · {device.color} · {device.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">IMEI Number</p>
          <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-foreground">{device.imei}</p>
          <p className="mt-1 text-xs text-muted-foreground">15-digit unique identifier</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Detail label="Stock status" value={<StockStatusBadge status={device.status} />} />
          <Detail label="Store" value={getStoreName(device.storeId, storeOptions)} />
          <Detail label="Condition" value={device.condition} />
          <Detail label="Grade" value={device.grade ?? 'Not set'} />
          <Detail label="Storage" value={device.storage} />
          <Detail label="Color" value={device.color} />
          <Detail label="Battery health" value={`${device.batteryHealth}%`} />
          <Detail label="Purchase price" value={formatCurrency(device.purchasePrice)} />
          <Detail label="Sale price" value={formatCurrency(device.price)} />
          <Detail label="Purchase date" value={device.purchaseDate} />
          <Detail label="Added by" value={device.addedBy} />
          <Detail label="Stock events" value={`${historyCount} recorded`} />
          <Detail label="Device ID" value={device.id} mono />
        </div>

        <div className="rounded-lg border border-border bg-surface-low/70 p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Purchase &amp; extras</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Source" value={device.source ?? 'Not set'} />
            <Detail label="Supplier" value={device.supplierName || '—'} />
            <Detail label="Warranty" value={device.warranty ?? 'None'} />
            <Detail label="Box available" value={device.boxAvailable ? 'Yes' : 'No'} />
            <Detail label="Original bill" value={device.originalBillAvailable ? 'Yes' : 'No'} />
            <Detail label="Accessories" value={device.accessories || '—'} />
          </div>
          {device.notes && (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Notes: </span>
              {device.notes}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onViewHistory}>View stock history</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
