import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandIcon } from '@/components/inventory/brand-icon'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getToday } from '@/data/formOptions'
import { formatCurrency } from '@/lib/format'

export function DeviceSaleModal({ open, onOpenChange, device, onSubmit }) {
  const initialPrice = device ? String(device.price ?? device.purchasePrice) : ''
  const [form, setForm] = useState({
    customer: '',
    salePrice: initialPrice,
    saleDate: getToday(),
    paymentMethod: 'Cash',
  })
  const [errors, setErrors] = useState({})

  if (!device) return null

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!form.customer.trim()) nextErrors.customer = 'Customer name is required.'
    if (!form.salePrice || Number(form.salePrice) <= 0) nextErrors.salePrice = 'Enter a valid sale price.'
    if (!form.saleDate) nextErrors.saleDate = 'Sale date is required.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({ ...form, customer: form.customer.trim(), salePrice: Number(form.salePrice) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record sale</DialogTitle>
          <DialogDescription>
            This marks the device as Sold and adds a sale record. The inventory row is kept for history.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-low p-3">
          <BrandIcon brand={device.brand} />
          <div>
            <p className="text-sm font-medium text-foreground">
              {device.brand} {device.model}
            </p>
            <p className="font-mono text-xs text-muted-foreground">{device.imei}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block" htmlFor="sale-customer">
              Customer name
            </Label>
            <Input
              id="sale-customer"
              value={form.customer}
              onChange={(event) => setForm({ ...form, customer: event.target.value })}
              placeholder="e.g. Ananya Verma"
              aria-invalid={Boolean(errors.customer)}
            />
            {errors.customer && <p className="mt-1 text-xs text-destructive">{errors.customer}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block" htmlFor="sale-price">
                Sale price (₹)
              </Label>
              <Input
                id="sale-price"
                type="number"
                min="0"
                value={form.salePrice}
                onChange={(event) => setForm({ ...form, salePrice: event.target.value })}
                aria-invalid={Boolean(errors.salePrice)}
              />
              {errors.salePrice && <p className="mt-1 text-xs text-destructive">{errors.salePrice}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block" htmlFor="sale-date">
                Sale date
              </Label>
              <Input
                id="sale-date"
                type="date"
                value={form.saleDate}
                onChange={(event) => setForm({ ...form, saleDate: event.target.value })}
                aria-invalid={Boolean(errors.saleDate)}
              />
              {errors.saleDate && <p className="mt-1 text-xs text-destructive">{errors.saleDate}</p>}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Purchase price was {formatCurrency(device.purchasePrice)}.
          </p>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="link" size="sm" asChild>
              <Link to={`/sales?imei=${encodeURIComponent(device.imei)}`} onClick={() => onOpenChange(false)}>
                Use detailed sales form
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="success">
                Confirm sale
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
