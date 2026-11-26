import { useState } from 'react'
import { ClipboardList, ReceiptText, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  addConditions as conditions,
  brands,
  getToday,
  grades,
  sources,
  warranties,
} from '@/data/formOptions'
import { deviceCatalog, stores as seedStores } from '@/data/mockData'
import { validateAddStockForm } from '@/lib/validation'

const createEmptyForm = () => ({
  brand: '',
  model: '',
  storage: '',
  color: '',
  imei: '',
  condition: '',
  grade: '',
  batteryHealth: '',
  purchasePrice: '',
  purchaseDate: getToday(),
  source: '',
  supplierName: '',
  storeId: '',
  boxAvailable: false,
  originalBillAvailable: false,
  accessories: '',
  warranty: 'None',
  notes: '',
})

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 border-b border-border bg-surface-low/70 p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </Card>
  )
}

function FormField({ label, required = false, error, hint, className, children }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function AddStockForm({ devices, onSubmit, storeOptions = seedStores, lockedStoreId = null }) {
  const [form, setForm] = useState(() => ({
    ...createEmptyForm(),
    storeId: lockedStoreId ?? '',
  }))
  const [errors, setErrors] = useState({})

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  const reset = () => {
    setForm({ ...createEmptyForm(), storeId: lockedStoreId ?? '' })
    setErrors({})
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateAddStockForm(form, devices)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).some((key) => nextErrors[key])) return

    const modelKey =
      Object.entries(deviceCatalog).find(
        ([, item]) => item.brand === form.brand && item.model === form.model,
      )?.[0] ?? 'custom'

    onSubmit({
      ...form,
      imei: String(form.imei).trim(),
      modelKey,
      purchasePrice: Number(form.purchasePrice),
      batteryHealth: Number(form.batteryHealth),
      status: 'In Stock',
    })

    reset()
  }

  return (
    <form id="add-stock-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
      <FormSection
        icon={Smartphone}
        title="Mobile details"
        description="Device identity, condition, and grade."
      >
        <FormField label="Brand" required error={errors.brand}>
          <Select value={form.brand} onValueChange={(value) => update('brand', value)}>
            <SelectTrigger aria-label="Brand" aria-invalid={Boolean(errors.brand)}>
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Model" required error={errors.model}>
          <Input
            aria-label="Model"
            value={form.model}
            onChange={(event) => update('model', event.target.value)}
            placeholder="e.g. iPhone 15 Pro"
            aria-invalid={Boolean(errors.model)}
          />
        </FormField>

        <FormField label="Storage" required error={errors.storage}>
          <Input
            aria-label="Storage"
            value={form.storage}
            onChange={(event) => update('storage', event.target.value)}
            placeholder="e.g. 256GB"
            aria-invalid={Boolean(errors.storage)}
          />
        </FormField>

        <FormField label="Color" required error={errors.color}>
          <Input
            aria-label="Color"
            value={form.color}
            onChange={(event) => update('color', event.target.value)}
            placeholder="e.g. Natural Titanium"
            aria-invalid={Boolean(errors.color)}
          />
        </FormField>

        <FormField
          label="IMEI Number"
          required
          error={errors.imei}
          hint={`${form.imei.length}/15 digits · numbers only`}
        >
          <Input
            aria-label="IMEI Number"
            value={form.imei}
            onChange={(event) => update('imei', event.target.value.replace(/\D/g, '').slice(0, 15))}
            placeholder="15-digit IMEI"
            inputMode="numeric"
            maxLength={15}
            className="font-mono"
            aria-invalid={Boolean(errors.imei)}
          />
        </FormField>

        <FormField label="Condition" required error={errors.condition}>
          <Select value={form.condition} onValueChange={(value) => update('condition', value)}>
            <SelectTrigger aria-label="Condition" aria-invalid={Boolean(errors.condition)}>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Grade" required error={errors.grade}>
          <Select value={form.grade} onValueChange={(value) => update('grade', value)}>
            <SelectTrigger aria-label="Grade" aria-invalid={Boolean(errors.grade)}>
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
        </FormField>

        <FormField label="Battery Health (%)" required error={errors.batteryHealth}>
          <Input
            aria-label="Battery Health"
            type="number"
            min="0"
            max="100"
            value={form.batteryHealth}
            onChange={(event) => update('batteryHealth', event.target.value)}
            placeholder="100"
            aria-invalid={Boolean(errors.batteryHealth)}
          />
        </FormField>
      </FormSection>

      <FormSection
        icon={ReceiptText}
        title="Purchase details"
        description="Cost, source, supplier, and receiving store."
      >
        <FormField label="Purchase Price (₹)" required error={errors.purchasePrice}>
          <Input
            aria-label="Purchase Price"
            type="number"
            min="0"
            value={form.purchasePrice}
            onChange={(event) => update('purchasePrice', event.target.value)}
            placeholder="0"
            aria-invalid={Boolean(errors.purchasePrice)}
          />
        </FormField>

        <FormField label="Purchase Date" required error={errors.purchaseDate}>
          <Input
            aria-label="Purchase Date"
            type="date"
            value={form.purchaseDate}
            onChange={(event) => update('purchaseDate', event.target.value)}
            aria-invalid={Boolean(errors.purchaseDate)}
          />
        </FormField>

        <FormField label="Source of Mobile" required error={errors.source}>
          <Select value={form.source} onValueChange={(value) => update('source', value)}>
            <SelectTrigger aria-label="Source of Mobile" aria-invalid={Boolean(errors.source)}>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Supplier Name"
          required={form.source === 'Supplier'}
          error={errors.supplierName}
          hint={form.source === 'Supplier' ? 'Required for supplier purchases' : 'Optional for other sources'}
        >
          <Input
            aria-label="Supplier Name"
            value={form.supplierName}
            onChange={(event) => update('supplierName', event.target.value)}
            placeholder="e.g. Nova Distributors"
            aria-invalid={Boolean(errors.supplierName)}
          />
        </FormField>

        <FormField label="Purchased For (Store)" required error={errors.storeId}>
          <Select
            value={form.storeId}
            onValueChange={(value) => update('storeId', value)}
            disabled={Boolean(lockedStoreId)}
          >
            <SelectTrigger aria-label="Purchased For Store" aria-invalid={Boolean(errors.storeId)}>
              <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent>
              {storeOptions.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </FormSection>

      <FormSection
        icon={ClipboardList}
        title="Additional details"
        description="Included items, warranty, and internal notes."
      >
        <label className="flex h-10 items-center gap-2 rounded-lg border border-input bg-surface px-3 text-sm text-foreground">
          <Checkbox
            aria-label="Box Available"
            checked={form.boxAvailable}
            onChange={(event) => update('boxAvailable', event.target.checked)}
          />
          Box Available
        </label>

        <label className="flex h-10 items-center gap-2 rounded-lg border border-input bg-surface px-3 text-sm text-foreground">
          <Checkbox
            aria-label="Original Bill Available"
            checked={form.originalBillAvailable}
            onChange={(event) => update('originalBillAvailable', event.target.checked)}
          />
          Original Bill Available
        </label>

        <FormField label="Accessories">
          <Input
            aria-label="Accessories"
            value={form.accessories}
            onChange={(event) => update('accessories', event.target.value)}
            placeholder="e.g. Charger, case, earbuds"
          />
        </FormField>

        <FormField label="Warranty">
          <Select value={form.warranty} onValueChange={(value) => update('warranty', value)}>
            <SelectTrigger aria-label="Warranty">
              <SelectValue placeholder="Select warranty" />
            </SelectTrigger>
            <SelectContent>
              {warranties.map((warranty) => (
                <SelectItem key={warranty} value={warranty}>
                  {warranty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Notes" className="sm:col-span-2 lg:col-span-3">
          <Textarea
            aria-label="Notes"
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="Add any internal notes about this device..."
          />
        </FormField>
      </FormSection>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={reset}>
          Reset form
        </Button>
        <Button type="submit">Save mobile</Button>
      </div>
    </form>
  )
}
