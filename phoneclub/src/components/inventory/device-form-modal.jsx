import { useMemo, useState } from 'react'
import { allConditions, brands, getToday, grades } from '@/data/formOptions'
import { deviceCatalog, stores as seedStores } from '@/data/mockData'
import { validateDeviceForm } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const emptyForm = {
  brand: '',
  model: '',
  storage: '',
  color: '',
  imei: '',
  purchasePrice: '',
  storeId: seedStores[0].id,
  purchaseDate: getToday(),
  condition: 'New',
  grade: 'Grade A',
  batteryHealth: '100',
  status: 'In Stock',
}

const models = [...new Set(Object.values(deviceCatalog).map((item) => item.model))].sort()

function toFormValues(device, lockedStoreId = null) {
  if (!device) return { ...emptyForm, storeId: lockedStoreId ?? emptyForm.storeId }

  return {
    brand: device.brand,
    model: device.model,
    storage: device.storage,
    color: device.color,
    imei: device.imei,
    purchasePrice: String(device.purchasePrice),
    storeId: lockedStoreId ?? device.storeId,
    purchaseDate: device.purchaseDate,
    condition: device.condition,
    grade: device.grade ?? 'Grade A',
    batteryHealth: String(device.batteryHealth),
    status: device.status,
  }
}

function Field({ label, error, children, className }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function DeviceFormModal({
  open,
  onOpenChange,
  device,
  devices,
  onSubmit,
  storeOptions = seedStores,
  lockedStoreId = null,
}) {
  const [form, setForm] = useState(() => toFormValues(device, lockedStoreId))
  const [errors, setErrors] = useState({})

  const modelOptions = useMemo(() => {
    if (!form.brand) return models
    return [...new Set(Object.values(deviceCatalog).filter((item) => item.brand === form.brand).map((item) => item.model))]
  }, [form.brand])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateDeviceForm(form, devices, device?.id)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      ...form,
      imei: String(form.imei).trim(),
      purchasePrice: Number(form.purchasePrice),
      batteryHealth: Number(form.batteryHealth),
      modelKey:
        device?.modelKey ??
        Object.entries(deviceCatalog).find(([, item]) => item.model === form.model)?.[0] ?? 'custom',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{device ? 'Edit device details' : 'Add new mobile'}</DialogTitle>
          <DialogDescription>
            Every device needs a unique 15-digit IMEI. Duplicate numbers are blocked automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand" error={errors.brand}>
              <Select value={form.brand} onValueChange={(value) => update('brand', value)}>
                <SelectTrigger aria-label="Brand" aria-invalid={Boolean(errors.brand)}>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Model" error={errors.model}>
              <Input
                aria-label="Model"
                list="inventory-model-options"
                value={form.model}
                onChange={(event) => update('model', event.target.value)}
                placeholder="e.g. iPhone 15 Pro"
                aria-invalid={Boolean(errors.model)}
              />
              <datalist id="inventory-model-options">
                {modelOptions.map((model) => (
                  <option key={model} value={model} />
                ))}
              </datalist>
            </Field>

            <Field label="Storage" error={errors.storage}>
              <Input
                aria-label="Storage"
                value={form.storage}
                onChange={(event) => update('storage', event.target.value)}
                placeholder="256GB"
                aria-invalid={Boolean(errors.storage)}
              />
            </Field>

            <Field label="Color" error={errors.color}>
              <Input
                aria-label="Color"
                value={form.color}
                onChange={(event) => update('color', event.target.value)}
                placeholder="Natural Titanium"
                aria-invalid={Boolean(errors.color)}
              />
            </Field>

            <Field label="IMEI Number" error={errors.imei} className="sm:col-span-2">
              <Input
                aria-label="IMEI Number"
                value={form.imei}
                onChange={(event) => update('imei', event.target.value.replace(/\D/g, '').slice(0, 15))}
                placeholder="15-digit IMEI"
                maxLength={15}
                inputMode="numeric"
                aria-invalid={Boolean(errors.imei)}
                className="font-mono"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {form.imei.length}/15 digits · numbers only
              </p>
            </Field>

            <Field label="Purchase Price (₹)" error={errors.purchasePrice}>
              <Input
                aria-label="Purchase Price"
                type="number"
                min="0"
                value={form.purchasePrice}
                onChange={(event) => update('purchasePrice', event.target.value)}
                aria-invalid={Boolean(errors.purchasePrice)}
              />
            </Field>

            <Field label="Store" error={errors.storeId}>
              <Select
                value={form.storeId}
                onValueChange={(value) => update('storeId', value)}
                disabled={Boolean(lockedStoreId)}
              >
                <SelectTrigger aria-label="Store" aria-invalid={Boolean(errors.storeId)}>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {storeOptions.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Purchase Date" error={errors.purchaseDate}>
              <Input
                aria-label="Purchase Date"
                type="date"
                value={form.purchaseDate}
                onChange={(event) => update('purchaseDate', event.target.value)}
                aria-invalid={Boolean(errors.purchaseDate)}
              />
            </Field>

            <Field label="Condition" error={errors.condition}>
              <Select value={form.condition} onValueChange={(value) => update('condition', value)}>
                <SelectTrigger aria-label="Condition" aria-invalid={Boolean(errors.condition)}>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {allConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Grade">
              <Select value={form.grade} onValueChange={(value) => update('grade', value)}>
                <SelectTrigger aria-label="Grade">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Battery Health (%)" error={errors.batteryHealth}>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.batteryHealth}
                onChange={(event) => update('batteryHealth', event.target.value)}
                aria-invalid={Boolean(errors.batteryHealth)}
              />
            </Field>

            <Field label="Stock Status">
              <Select value={form.status} onValueChange={(value) => update('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {['In Stock', 'Sold', 'Reserved', 'Returned'].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{device ? 'Save changes' : 'Add device'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
