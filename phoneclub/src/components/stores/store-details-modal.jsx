import { Banknote, CalendarDays, MapPin, PackageCheck, Phone, ReceiptText, UserRound, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency, formatNumber } from '@/lib/format'

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-words text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function StoreDetailsModal({
  open,
  onOpenChange,
  store,
  overview,
  onEdit,
  onToggle,
  canManage = false,
}) {
  if (!store) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{store.name}</DialogTitle>
            <Badge variant={store.status === 'Active' ? 'success' : 'secondary'}>{store.status}</Badge>
          </div>
          <DialogDescription>
            Store ID {store.code} · Opened {store.openingDate}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Detail icon={MapPin} label="Address" value={store.address} />
          <Detail icon={UserRound} label="Store Manager" value={store.manager} />
          <Detail icon={Phone} label="Contact Number" value={store.contact} />
          <Detail icon={CalendarDays} label="Opening Date" value={store.openingDate} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-surface-low p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Available mobiles</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatNumber(overview.available)}</p>
          </div>
          <div className="rounded-lg bg-surface-low p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Mobiles sold</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatNumber(overview.sold)}</p>
          </div>
          <div className="rounded-lg bg-surface-low p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Purchase value</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(overview.purchaseValue)}</p>
          </div>
          <div className="rounded-lg bg-surface-low p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sales revenue</p>
            <p className="mt-1 text-sm font-semibold text-success">{formatCurrency(overview.revenue)}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <UserRound className="h-4 w-4 text-primary" />
            Assigned employees ({overview.employees.length})
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {overview.employees.length ? (
              overview.employees.map((employee) => (
                <Badge key={employee.id} variant="secondary" className="gap-1">
                  {employee.name}
                  <span className="text-[10px] text-muted-foreground">· {employee.role.replace('_', ' ')}</span>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No employees assigned in the mock user records.</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <div className="mr-auto flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><PackageCheck className="h-3 w-3" />{overview.totalDevices} devices</span>
            <span className="inline-flex items-center gap-1"><ReceiptText className="h-3 w-3" />{overview.sold} sales</span>
            <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" />{formatCurrency(overview.revenue)}</span>
            <span className="inline-flex items-center gap-1"><Banknote className="h-3 w-3" />{formatCurrency(overview.purchaseValue)}</span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {canManage && (
            <>
              <Button variant={store.status === 'Active' ? 'warning' : 'success'} onClick={onToggle}>
                {store.status === 'Active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button onClick={onEdit}>Edit store</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
