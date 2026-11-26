import { useMemo, useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import { TablePagination } from '@/components/common/table-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { stores as seedStores } from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import { filterTransfers, transferStatuses } from '@/data/transferSelectors'
import { cn } from '@/lib/utils'

const defaultFilters = {
  storeId: 'all',
  status: 'all',
  direction: 'all',
  fromDate: '',
  toDate: '',
}

const pageSize = 10

function FilterField({ label, children }) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

export function TransferHistoryCard({
  transfers,
  storeOptions = seedStores,
  lockedStoreId = null,
}) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)

  const effectiveStoreId = lockedStoreId ?? (filters.storeId === 'all' ? 'all' : filters.storeId)
  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      storeId: effectiveStoreId,
      direction: lockedStoreId ? filters.direction : 'all',
    }),
    [filters, effectiveStoreId, lockedStoreId],
  )

  const filteredTransfers = useMemo(
    () => filterTransfers({ transfers, query, filters: effectiveFilters, storeOptions }),
    [transfers, query, effectiveFilters, storeOptions],
  )

  const totalPages = Math.max(1, Math.ceil(filteredTransfers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleTransfers = filteredTransfers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const reset = () => {
    setFilters(defaultFilters)
    setQuery('')
    setPage(1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer history</CardTitle>
        <CardDescription>Every store-to-store movement with source, destination, and status.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-surface-low/60 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search transfers"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search transfer ID, brand, model, IMEI or store..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                <strong className="font-semibold text-foreground">{filteredTransfers.length}</strong> transfer
                {filteredTransfers.length === 1 ? '' : 's'}
              </span>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw />
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <FilterField label="Store">
              <Select
                value={effectiveStoreId}
                onValueChange={(value) => updateFilter('storeId', value)}
                disabled={Boolean(lockedStoreId)}
              >
                <SelectTrigger aria-label="Transfer store filter" className="h-9">
                  <SelectValue placeholder="All stores" />
                </SelectTrigger>
                <SelectContent>
                  {!lockedStoreId && <SelectItem value="all">All stores</SelectItem>}
                  {storeOptions.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Status">
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger aria-label="Transfer status filter" className="h-9">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {transferStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Direction">
              <Select
                value={filters.direction}
                onValueChange={(value) => updateFilter('direction', value)}
                disabled={!lockedStoreId}
              >
                <SelectTrigger aria-label="Transfer direction filter" className="h-9">
                  <SelectValue placeholder="Any direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any direction</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Transfer date from">
              <Input
                aria-label="Transfer date from"
                type="date"
                value={filters.fromDate}
                onChange={(event) => updateFilter('fromDate', event.target.value)}
                className="h-9"
              />
            </FilterField>

            <FilterField label="Transfer date to">
              <Input
                aria-label="Transfer date to"
                type="date"
                value={filters.toDate}
                onChange={(event) => updateFilter('toDate', event.target.value)}
                className="h-9"
              />
            </FilterField>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="scrollbar-thin overflow-x-auto">
            <Table className="min-w-[900px] text-xs [&_td]:px-3 [&_td]:py-3 [&_th]:h-11 [&_th]:px-3">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>Mobile Brand &amp; Model</TableHead>
                  <TableHead>IMEI Number</TableHead>
                  <TableHead>Source Store</TableHead>
                  <TableHead>Destination Store</TableHead>
                  <TableHead>Transfer Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">
                      No transfers match the current search and filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="whitespace-nowrap font-medium text-foreground">{transfer.id}</TableCell>
                      <TableCell>
                        <span className="block font-medium text-foreground">
                          {transfer.brand} {transfer.model}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">{transfer.note}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-[11px]">{transfer.imei}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {getStoreName(transfer.fromStoreId, storeOptions)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {getStoreName(transfer.toStoreId, storeOptions)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {transfer.date ?? String(transfer.createdAt).slice(0, 10)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transfer.status === 'Completed' ? 'success' : 'warning'}
                          className={cn('whitespace-nowrap')}
                        >
                          {transfer.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredTransfers.length}
          pageSize={pageSize}
          noun="transfers"
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  )
}
