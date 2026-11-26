import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Info } from 'lucide-react'
import { BrandIcon } from '@/components/inventory/brand-icon'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getToday } from '@/data/formOptions'
import { stores as seedStores } from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import { transferStatuses } from '@/data/transferSelectors'

export function DeviceTransferModal({
  open,
  onOpenChange,
  device,
  onSubmit,
  storeOptions = seedStores,
}) {
  const [form, setForm] = useState({
    toStoreId: '',
    note: '',
    transferDate: getToday(),
    status: 'Completed',
  })
  const [error, setError] = useState('')

  const destinations = useMemo(
    () => (device ? storeOptions.filter((store) => store.id !== device.storeId) : storeOptions),
    [device, storeOptions],
  )

  if (!device) return null

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.toStoreId) {
      setError('Select a destination store.')
      return
    }
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Transfer to another store</DialogTitle>
          <DialogDescription>
            The existing inventory record is updated in place. No duplicate device is created.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-low p-3">
          <BrandIcon brand={device.brand} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {device.brand} {device.model}
            </p>
            <p className="font-mono text-xs text-muted-foreground">{device.imei}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-md bg-surface-container px-2 py-1 font-medium text-foreground">
            {getStoreName(device.storeId, storeOptions)}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">New location</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Destination store</Label>
            <Select value={form.toStoreId} onValueChange={(value) => setForm({ ...form, toStoreId: value })}>
              <SelectTrigger aria-label="Destination store" aria-invalid={Boolean(error)}>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          <div>
            <Label className="mb-1.5 block" htmlFor="transfer-date">
              Transfer date
            </Label>
            <Input
              id="transfer-date"
              type="date"
              value={form.transferDate}
              onChange={(event) => setForm({ ...form, transferDate: event.target.value })}
            />
          </div>

          <div>
            <Label className="mb-1.5 block" htmlFor="transfer-note">
              Note (optional)
            </Label>
            <Input
              id="transfer-note"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              placeholder="e.g. Store replenishment"
            />
          </div>

          <div>
            <Label className="mb-1.5 block">Transfer Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger aria-label="Transfer Status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {transferStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {device.status === 'Sold' && (
            <p className="rounded-lg border border-destructive/30 bg-destructive-soft p-3 text-xs text-destructive">
              Sold devices cannot be transferred.
            </p>
          )}

          <div className="flex gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              The device status stays <strong className="font-semibold text-foreground">In Stock</strong> at its
              destination. The move is recorded in stock history.
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="link" size="sm" asChild>
              <Link to={`/transfers?imei=${encodeURIComponent(device.imei)}`} onClick={() => onOpenChange(false)}>
                Use detailed transfer form
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={device.status === 'Sold'}>
                Confirm transfer
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
