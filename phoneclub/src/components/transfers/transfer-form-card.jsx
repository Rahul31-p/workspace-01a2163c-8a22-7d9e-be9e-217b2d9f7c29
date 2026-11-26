import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Info, Search, Smartphone, X } from 'lucide-react'
import { BrandIcon } from '@/components/inventory/brand-icon'
import { StockStatusBadge } from '@/components/inventory/stock-status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getToday } from '@/data/formOptions'
import { getStoreName } from '@/data/selectors'
import { transferStatuses } from '@/data/transferSelectors'
import { formatCurrency } from '@/lib/format'

const emptyForm = {
  toStoreId: '',
  transferDate: getToday(),
  note: '',
  status: 'Completed',
}

function Detail({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={`mt-1 text-sm text-foreground ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

export function TransferFormCard({ devices, stores, onSubmit }) {
  const [searchParams] = useSearchParams()
  const imeiParam = searchParams.get('imei')

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
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(() =>
    prefilled && !prefilled.matches.length ? 'No mobile found for that IMEI.' : '',
  )

  const selectedDevice = devices.find((device) => device.id === selectedId) ?? null
  const destinations = selectedDevice
    ? stores.filter((store) => store.id !== selectedDevice.storeId)
    : stores

  const handleSearch = () => {
    const term = query.trim().toLowerCase()
    if (!term) {
      setResults([])
      setError('Enter an IMEI number to search.')
      return
    }

    const matches = devices.filter((device) => device.imei.toLowerCase().includes(term))
    setResults(matches)
    setError(matches.length ? '' : 'No mobile found for that IMEI.')
  }

  const selectDevice = (device) => {
    setSelectedId(device.id)
    setQuery(device.imei)
    setResults([])
    setForm(emptyForm)
    setError(
      device.status === 'Sold'
        ? 'This mobile is already sold and cannot be transferred.'
        : '',
    )
  }

  const clearSelection = () => {
    setSelectedId(null)
    setResults([])
    setQuery('')
    setForm(emptyForm)
    setError('')
  }

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!selectedDevice) {
      setError('Search and select a mobile first.')
      return
    }

    const result = onSubmit(selectedDevice.id, {
      ...form,
      note: form.note.trim(),
    })

    if (!result?.ok) {
      setError(result?.message ?? 'Transfer could not be completed.')
      return
    }

    clearSelection()
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Transfer stock</CardTitle>
          <CardDescription>Search one device by IMEI, verify its store, then move it in place.</CardDescription>
        </div>
        <Badge variant="secondary" className="gap-1">
          <BadgeCheck className="h-3 w-3" />
          No duplicates
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-surface-low/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search transfer IMEI"
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

        {error && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive-soft p-3 text-xs text-destructive">
            {error}
          </p>
        )}

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
                  <Detail label="IMEI Number" value={selectedDevice.imei} mono />
                  <Detail label="Device ID" value={selectedDevice.id} mono />
                  <Detail label="Purchase Price" value={formatCurrency(selectedDevice.purchasePrice)} />
                  <Detail label="Purchase Date" value={selectedDevice.purchaseDate} />
                  <Detail label="Condition" value={selectedDevice.condition} />
                  <Detail label="Grade" value={selectedDevice.grade ?? 'Grade A'} />
                  <Detail label="Battery Health" value={`${selectedDevice.batteryHealth}%`} />
                  <Detail label="Source" value={selectedDevice.source ?? 'Other'} />
                  <Detail label="Current Store" value={getStoreName(selectedDevice.storeId, stores)} />
                  <Detail label="Stock Status" value={<StockStatusBadge status={selectedDevice.status} />} />
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  Verified at <strong className="font-semibold text-foreground">{getStoreName(selectedDevice.storeId, stores)}</strong>.
                  IMEI, purchase price, condition, and all original details are preserved. No duplicate record is created.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label className="mb-1.5 block">Source Store</Label>
                <Input
                  aria-label="Source Store"
                  value={getStoreName(selectedDevice.storeId, stores)}
                  readOnly
                  className="bg-surface-low"
                />
              </div>

              <div>
                <Label className="mb-1.5 block">Destination Store <span className="text-destructive">*</span></Label>
                <Select value={form.toStoreId} onValueChange={(value) => update('toStoreId', value)}>
                  <SelectTrigger aria-label="Destination Store">
                    <SelectValue placeholder="Select destination store" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!destinations.length && (
                  <p className="mt-1 text-xs text-warning">No other store is available for transfer.</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block" htmlFor="transfer-date">
                    Transfer Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="transfer-date"
                    aria-label="Transfer Date"
                    type="date"
                    value={form.transferDate}
                    onChange={(event) => update('transferDate', event.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-1.5 block">Transfer Status</Label>
                  <Select value={form.status} onValueChange={(value) => update('status', value)}>
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
              </div>

              <div>
                <Label className="mb-1.5 block" htmlFor="transfer-note">
                  Transfer Note
                </Label>
                <Textarea
                  id="transfer-note"
                  aria-label="Transfer Note"
                  value={form.note}
                  onChange={(event) => update('note', event.target.value)}
                  placeholder="e.g. Store replenishment or customer request"
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-low p-3 text-xs text-muted-foreground">
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  Store stock counts update immediately after confirmation. The move is recorded in transfer history.
                </span>
              </div>

              <Button type="submit" className="w-full" disabled={selectedDevice.status === 'Sold'}>
                Confirm transfer
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
