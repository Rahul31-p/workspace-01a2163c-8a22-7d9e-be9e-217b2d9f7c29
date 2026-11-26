import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getToday } from '@/data/formOptions'
import { validateStoreForm } from '@/data/storeSelectors'

const emptyForm = {
  name: '',
  address: '',
  manager: '',
  contact: '',
  status: 'Active',
  openingDate: getToday(),
}

export function StoreFormModal({ open, onOpenChange, store, stores, onSubmit }) {
  const [form, setForm] = useState(() =>
    store
      ? {
          name: store.name,
          address: store.address,
          manager: store.manager,
          contact: store.contact,
          status: store.status,
          openingDate: store.openingDate,
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState({})

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateStoreForm(form, stores, store?.id)

    setErrors(nextErrors)
    if (Object.keys(nextErrors).some((key) => nextErrors[key])) return

    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{store ? 'Edit store' : 'Add new store'}</DialogTitle>
          <DialogDescription>
            Store details are saved to shared in-memory state and appear across selectors and reports immediately.
          </DialogDescription>
        </DialogHeader>

        {store && (
          <div className="rounded-lg border border-border bg-surface-low px-3 py-2 text-xs">
            <span className="font-medium text-muted-foreground">Store ID</span>
            <span className="ml-2 font-mono font-semibold text-foreground">{store.code}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block" htmlFor="store-name">
              Store Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="store-name"
              aria-label="Store Name"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="e.g. Rohini West"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="sm:col-span-2">
            <Label className="mb-1.5 block" htmlFor="store-address">
              Store Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="store-address"
              aria-label="Store Address"
              value={form.address}
              onChange={(event) => update('address', event.target.value)}
              placeholder="Street, area, city, PIN"
              aria-invalid={Boolean(errors.address)}
            />
            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
          </div>

          <div>
            <Label className="mb-1.5 block" htmlFor="store-manager">
              Store Manager <span className="text-destructive">*</span>
            </Label>
            <Input
              id="store-manager"
              aria-label="Store Manager"
              value={form.manager}
              onChange={(event) => update('manager', event.target.value)}
              placeholder="e.g. Ananya Verma"
              aria-invalid={Boolean(errors.manager)}
            />
            {errors.manager && <p className="mt-1 text-xs text-destructive">{errors.manager}</p>}
          </div>

          <div>
            <Label className="mb-1.5 block" htmlFor="store-contact">
              Contact Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="store-contact"
              aria-label="Contact Number"
              inputMode="numeric"
              value={form.contact}
              onChange={(event) => update('contact', event.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit number"
              aria-invalid={Boolean(errors.contact)}
            />
            {errors.contact && <p className="mt-1 text-xs text-destructive">{errors.contact}</p>}
          </div>

          <div>
            <Label className="mb-1.5 block">Store Status</Label>
            <Select value={form.status} onValueChange={(value) => update('status', value)}>
              <SelectTrigger aria-label="Store Status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block" htmlFor="store-opening-date">
              Opening Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="store-opening-date"
              aria-label="Opening Date"
              type="date"
              value={form.openingDate}
              onChange={(event) => update('openingDate', event.target.value)}
              aria-invalid={Boolean(errors.openingDate)}
            />
            {errors.openingDate && <p className="mt-1 text-xs text-destructive">{errors.openingDate}</p>}
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{store ? 'Save changes' : 'Add store'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
