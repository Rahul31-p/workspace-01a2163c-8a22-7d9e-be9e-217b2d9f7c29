import { useMemo, useState } from 'react'
import { Download, FileSpreadsheet, FileText, RotateCcw, Search } from 'lucide-react'
import { TablePagination } from '@/components/common/table-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { paymentMethods } from '@/data/formOptions'
import { stores as seedStores } from '@/data/mockData'
import { filterSales, saleAmount, saleGrossProfit, saleProfitMargin } from '@/data/salesSelectors'
import { getStoreName } from '@/data/selectors'
import { useStore } from '@/context/store-context'
import { useToast } from '@/context/toast-context'
import { exportSalesToExcel, exportSalesToPdf } from '@/lib/salesExport'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

const defaultFilters = {
  storeId: 'all',
  paymentMethod: 'all',
  profit: 'all',
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

export function SalesHistoryCard({ sales, storeOptions = seedStores, lockedStoreId = null }) {
  const { storeId } = useStore()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)

  const scopedSales = useMemo(
    () => (storeId === 'all' ? sales : sales.filter((sale) => sale.storeId === storeId)),
    [sales, storeId],
  )

  const effectiveStoreId = lockedStoreId ?? (filters.storeId === 'all' ? 'all' : filters.storeId)
  const filteredSales = useMemo(
    () =>
      filterSales({
        sales: scopedSales,
        query,
        filters: { ...filters, storeId: effectiveStoreId },
        storeOptions,
      }),
    [scopedSales, query, filters, effectiveStoreId, storeOptions],
  )

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleSales = filteredSales.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  const reset = () => {
    setFilters(defaultFilters)
    setQuery('')
    setPage(1)
  }

  const handleExport = (type) => {
    if (!filteredSales.length) {
      toast({ title: 'Nothing to export', description: 'No sales match the current filters.', variant: 'info' })
      return
    }

    if (type === 'excel') {
      exportSalesToExcel(filteredSales, 'phoneclub-sales.xlsx', storeOptions)
    } else {
      exportSalesToPdf(filteredSales, 'phoneclub-sales.pdf', storeOptions)
    }

    toast({
      title: `${type === 'excel' ? 'Excel' : 'PDF'} export started`,
      description: `${filteredSales.length} transaction(s) exported.`,
      variant: 'success',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <CardTitle>Sales history</CardTitle>
          <CardDescription>Every recorded transaction with profit and payment details.</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleExport('excel')}>
              <FileSpreadsheet />
              Export Excel
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleExport('pdf')}>
              <FileText />
              Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-surface-low/60 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search sales"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search invoice, model, IMEI, store or customer..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                <strong className="font-semibold text-foreground">{filteredSales.length}</strong> transaction
                {filteredSales.length === 1 ? '' : 's'}
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
                <SelectTrigger aria-label="Sales store filter" className="h-9">
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

            <FilterField label="Payment method">
              <Select value={filters.paymentMethod} onValueChange={(value) => updateFilter('paymentMethod', value)}>
                <SelectTrigger aria-label="Payment method filter" className="h-9">
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Profit">
              <Select value={filters.profit} onValueChange={(value) => updateFilter('profit', value)}>
                <SelectTrigger aria-label="Profit filter" className="h-9">
                  <SelectValue placeholder="All sales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sales</SelectItem>
                  <SelectItem value="profitable">Profitable</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Sale date from">
              <Input
                aria-label="Sale date from"
                type="date"
                value={filters.fromDate}
                onChange={(event) => updateFilter('fromDate', event.target.value)}
                className="h-9"
              />
            </FilterField>

            <FilterField label="Sale date to">
              <Input
                aria-label="Sale date to"
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
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Mobile Model</TableHead>
                  <TableHead>IMEI</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Sale Date</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-28 text-center text-sm text-muted-foreground">
                      No transactions match the current search and filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleSales.map((sale) => {
                    const profit = saleGrossProfit(sale)

                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="whitespace-nowrap font-medium text-foreground">
                          {sale.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <span className="block font-medium text-foreground">{sale.model}</span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">
                            {sale.variant ?? ''}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-[11px]">{sale.imei}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {getStoreName(sale.storeId, storeOptions)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{sale.date}</TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-foreground">
                          {formatCurrency(saleAmount(sale))}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {sale.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={cn('block font-medium', profit >= 0 ? 'text-success' : 'text-destructive')}>
                            {formatCurrency(profit)}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">
                            {saleProfitMargin(sale).toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filteredSales.length}
          pageSize={pageSize}
          noun="transactions"
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  )
}
