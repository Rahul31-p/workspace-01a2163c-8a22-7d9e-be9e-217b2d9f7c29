import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BadgeCheck, Calculator, Search, Smartphone, X } from 'lucide-react'
import { BrandIcon } from '@/components/inventory/brand-icon'
import { StockStatusBadge } from '@/components/inventory/stock-status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getToday, paymentMethods } from '@/data/formOptions'
import { stores as seedStores } from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import { formatCurrency } from '@/lib/format'

const emptyForm = {
  sellingPrice: '',
  saleDate: getToday(),
  paymentMethod: 'Cash',
  customer: '',
  customerPhone: '',
  notes: '',
}

function Detail({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={`mt-1 text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

export function RecordSaleCard({ devices, onSubmit, storeOptions = seedStores }) {
  const [searchParams] = useSearchParams()
  const imeiParam = searchParams.get('imei')

  // Inventory row actions deep-link into this form with the device IMEI.
  const prefilled = useMemo(() => {
    if (!imeiParam) return null

    const term = imeiParam.trim()
    const matches = devices.filter((device) => device.imei.toLowerCase().includes(term.toLowerCase()))
    const device = matches.find((item) => item.status !== 'Sold') ?? matches[0] ?? null

    return { term, matches, device }
  }, [imeiParam, devices])

  const [query, setQuery] = useState(() => prefilled?.term.slice(0, 15) ?? '')
  const [results, setResults] = useState(() => prefilled?.matches ?? [])
  const [selectedId, setSelectedId] = useState(() => prefilled?.device?.id ?? null)
  const [form, setForm] = useState(() =>
    prefilled?.device ? { ...emptyForm, sellingPrice: String(prefilled.device.price ?? prefilled.device.purchasePrice) } : emptyForm,
  )
  const [errors, setErrors] = useState({})
  const [searchError, setSearchError] = useState(() =>
    prefilled && !prefilled.matches.length ? 'No mobile found for that IMEI.' : '',
  )

  const selectedDevice = devices.find((device) => device.id === selectedId) ?? null
  const sold = selectedDevice?.status === 'Sold'

  const sellingPrice = Number(form.sellingPrice)
  const grossProfit = selectedDevice && sellingPrice ? sellingPrice - selectedDevice.purchasePrice : 0
  const profitMargin = sellingPrice ? (grossProfit / sellingPrice) * 100 : 0

  const handleSearch = () => {
    const term = query.trim().toLowerCase()
    if (!term) {
      setResults([])
      setSearchError('Enter an IMEI number to search.')
      return
    }

    const matches = devices.filter((device) => device.imei.toLowerCase().includes(term))
    setResults(matches)
    setSearchError(matches.length ? '' : 'No mobile found for that IMEI.')
  }

  const selectDevice = (device) => {
    setSelectedId(device.id)
    setQuery(device.imei)
    setResults([])
    setSearchError('')
    setErrors({})
    setForm({ ...emptyForm, sellingPrice: String(device.price ?? device.purchasePrice) })
  }

  const clearSelection = () => {
    setSelectedId(null)
    setResults([])
    setSearchError('')
    setErrors({})
    setForm(emptyForm)
  }

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!selectedDevice) {
      setSearchError('Search and select a mobile first.')
      return
    }
    if (sold) return

    const nextErrors = {}
    if (!form.sellingPrice || Number.isNaN(sellingPrice) || sellingPrice <= 0) {
      nextErrors.sellingPrice = 'Selling price is required.'
    }
    if (!form.saleDate) nextErrors.saleDate = 'Sale date is required.'
    if (!form.paymentMethod) nextErrors.paymentMethod = 'Select a payment method.'
    if (form.customerPhone && !/^\d{10}$/.test(form.customerPhone.replace(/\D/g, ''))) {
      nextErrors.customerPhone = 'Enter a valid 10-digit phone number.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).some((key) => nextErrors[key])) return

    const sale = onSubmit(selectedDevice.id, {
      ...form,
      customer: form.customer.trim(),
      customerPhone: form.customerPhone.trim(),
      notes: form.notes.trim(),
      salePrice: sellingPrice,
    })

    if (!sale) {
      setSearchError('This mobile is no longer available for sale.')
      return
    }

    clearSelection()
    setQuery('')
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Record a sale</CardTitle>
          <CardDescription>Find a device by IMEI, review it, then capture payment details.</CardDescription>
        </div>
        <Badge variant="secondary" className="gap-1">
          <BadgeCheck className="h-3 w-3" />
          IMEI verified
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-surface-low/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search IMEI"
                value={query}
                onChange={(event) => setQuery(event.target.value.replace(/\D/g, '').slice(0, 15))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleSearch()
                  }
                }}
                placeholder="Enter 15-digit IMEI"
                inputMode="numeric"
                className="font-mono"
              />
            </div>
            <Button type="button" onClick={handleSearch} className="shrink-0">
              <Search />
              Find mobile
            </Button>
          </div>

          {searchError && <p className="mt-2 text-xs text-destructive">{searchError}</p>}

          {results.length > 0 && (
            <div className="mt-3 space-y-2 rounded-lg border border-border bg-surface p-2">
              <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {results.length} matching mobile{results.length === 1 ? '' : 's'}
              </p>
              {results.map((device) => (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => selectDevice(device)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-low"
                >
                  <BrandIcon brand={device.brand} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {device.brand} {device.model}
                    </span>
                    <span className="block font-mono text-xs text-muted-foreground">{device.imei}</span>
                  </span>
                  <StockStatusBadge status={device.status} />
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedDevice && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Selected mobile</h3>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
                  <X />
                  Change
                </Button>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail label="Brand" value={selectedDevice.brand} />
                  <Detail label="Model" value={selectedDevice.model} />
                  <Detail label="Storage" value={selectedDevice.storage} />
                  <Detail label="Color" value={selectedDevice.color} />
                  <Detail label="IMEI" value={selectedDevice.imei} mono />
                  <Detail label="Purchase Price" value={formatCurrency(selectedDevice.purchasePrice)} />
                  <Detail label="Current Store" value={getStoreName(selectedDevice.storeId, storeOptions)} />
                  <Detail label="Status" value={<StockStatusBadge status={selectedDevice.status} />} />
                </div>
              </div>

              {sold && (
                <p className="rounded-lg border border-destructive/30 bg-destructive-soft p-3 text-xs text-destructive">
                  This mobile is already sold and cannot be sold again.
                </p>
              )}

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Calculator className="h-4 w-4 text-primary" />
                  Automatic calculation
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Gross profit</p>
                    <p className={`mt-1 text-lg font-semibold ${grossProfit < 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatCurrency(grossProfit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Profit margin</p>
                    <p className={`mt-1 text-lg font-semibold ${profitMargin < 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block" htmlFor="selling-price">
                    Selling Price <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="selling-price"
                    aria-label="Selling Price"
                    type="number"
                    min="0"
                    value={form.sellingPrice}
                    onChange={(event) => update('sellingPrice', event.target.value)}
                    disabled={sold}
                    aria-invalid={Boolean(errors.sellingPrice)}
                  />
                  {errors.sellingPrice && <p className="mt-1 text-xs text-destructive">{errors.sellingPrice}</p>}
                </div>

                <div>
                  <Label className="mb-1.5 block" htmlFor="sale-date">
                    Sale Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sale-date"
                    aria-label="Sale Date"
                    type="date"
                    value={form.saleDate}
                    onChange={(event) => update('saleDate', event.target.value)}
                    disabled={sold}
                    aria-invalid={Boolean(errors.saleDate)}
                  />
                  {errors.saleDate && <p className="mt-1 text-xs text-destructive">{errors.saleDate}</p>}
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">Payment Method <span className="text-destructive">*</span></Label>
                <Select
                  value={form.paymentMethod}
                  onValueChange={(value) => update('paymentMethod', value)}
                  disabled={sold}
                >
                  <SelectTrigger aria-label="Payment Method" aria-invalid={Boolean(errors.paymentMethod)}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentMethod && <p className="mt-1 text-xs text-destructive">{errors.paymentMethod}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block" htmlFor="customer-name">
                    Customer Name <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="customer-name"
                    aria-label="Customer Name"
                    value={form.customer}
                    onChange={(event) => update('customer', event.target.value)}
                    placeholder="Walk-in customer"
                    disabled={sold}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block" htmlFor="customer-phone">
                    Customer Phone <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="customer-phone"
                    aria-label="Customer Phone"
                    inputMode="numeric"
                    value={form.customerPhone}
                    onChange={(event) => update('customerPhone', event.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit number"
                    disabled={sold}
                    aria-invalid={Boolean(errors.customerPhone)}
                  />
                  {errors.customerPhone && <p className="mt-1 text-xs text-destructive">{errors.customerPhone}</p>}
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block" htmlFor="sale-notes">
                  Notes
                </Label>
                <Textarea
                  id="sale-notes"
                  aria-label="Sale Notes"
                  value={form.notes}
                  onChange={(event) => update('notes', event.target.value)}
                  placeholder="Optional notes about this sale..."
                  disabled={sold}
                />
              </div>

              <Button type="submit" variant="success" className="w-full" disabled={!selectedDevice || sold}>
                Confirm sale
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
