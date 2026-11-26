import { RotateCcw, Search } from 'lucide-react'
import { allStoreOption, stores as seedStores } from '@/data/mockData'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function FilterField({ label, children }) {
  return (
    <div className="min-w-0">
      <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

export function InventoryFilters({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  options,
  resultCount,
  onReset,
  storeOptions = seedStores,
  lockedStoreId = null,
}) {
  const update = (key, value) => onFiltersChange({ ...filters, [key]: value })

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by IMEI, brand, model, color or storage..."
            aria-label="Search inventory"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            <strong className="font-semibold text-foreground">{resultCount}</strong> device
            {resultCount === 1 ? '' : 's'} found
          </span>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw />
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <FilterField label="Brand">
          <Select value={filters.brand} onValueChange={(value) => update('brand', value)}>
            <SelectTrigger aria-label="Filter by brand" className="h-9">
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {options.brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Model">
          <Select value={filters.model} onValueChange={(value) => update('model', value)}>
            <SelectTrigger aria-label="Filter by model" className="h-9">
              <SelectValue placeholder="All models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All models</SelectItem>
              {options.models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Store">
          <Select
            value={lockedStoreId ?? filters.storeId}
            onValueChange={(value) => update('storeId', value)}
            disabled={Boolean(lockedStoreId)}
          >
            <SelectTrigger aria-label="Filter by store" className="h-9">
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent>
              {!lockedStoreId && <SelectItem value={allStoreOption.id}>All stores</SelectItem>}
              {storeOptions.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Stock status">
          <Select value={filters.status} onValueChange={(value) => update('status', value)}>
            <SelectTrigger aria-label="Filter by stock status" className="h-9">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {options.statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === 'Transferred' ? 'Transferred (history)' : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Condition">
          <Select value={filters.condition} onValueChange={(value) => update('condition', value)}>
            <SelectTrigger aria-label="Filter by condition" className="h-9">
              <SelectValue placeholder="All conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All conditions</SelectItem>
              {options.conditions.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Purchased from">
          <Input
            aria-label="Purchased from date"
            type="date"
            value={filters.fromDate}
            onChange={(event) => update('fromDate', event.target.value)}
            className="h-9"
          />
        </FilterField>

        <FilterField label="Purchased to">
          <Input
            aria-label="Purchased to date"
            type="date"
            value={filters.toDate}
            onChange={(event) => update('toDate', event.target.value)}
            className="h-9"
          />
        </FilterField>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:max-w-md">
        <FilterField label="Min price (₹)">
          <Input
            aria-label="Minimum purchase price"
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(event) => update('minPrice', event.target.value)}
            placeholder="0"
            className="h-9"
          />
        </FilterField>
        <FilterField label="Max price (₹)">
          <Input
            aria-label="Maximum purchase price"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) => update('maxPrice', event.target.value)}
            placeholder="Any"
            className="h-9"
          />
        </FilterField>
      </div>
    </Card>
  )
}
