import { ArrowLeftRight, CircleDollarSign, Pencil, Plus } from 'lucide-react'
import { BrandIcon } from '@/components/inventory/brand-icon'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MOCK_NOW } from '@/data/mockData'
import { formatRelativeTime } from '@/lib/format'

const icons = {
  added: Plus,
  transfer: ArrowLeftRight,
  sale: CircleDollarSign,
  update: Pencil,
}

export function DeviceHistoryModal({ open, onOpenChange, device, history }) {
  if (!device) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <BrandIcon brand={device.brand} />
            <div>
              <DialogTitle>Stock history</DialogTitle>
              <DialogDescription>
                {device.brand} {device.model} · IMEI {device.imei}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-1">
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No stock events recorded yet.</p>
          ) : (
            history.map((event) => {
              const Icon = icons[event.type] ?? Pencil

              return (
                <div key={event.id} className="flex gap-3 rounded-lg p-3 hover:bg-surface-low">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(event.timestamp, MOCK_NOW)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{event.detail}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {event.user} · {event.status}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
