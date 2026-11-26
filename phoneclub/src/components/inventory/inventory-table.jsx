import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { BrandIcon } from '@/components/inventory/brand-icon'
import { StockStatusBadge } from '@/components/inventory/stock-status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { stores } from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import { formatCurrency, formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'

function SortHeader({ label, title, sortKey, sort, onSort }) {
  const active = sort.key === sortKey
  const Icon = active ? (sort.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <button
      type="button"
      title={title}
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide transition-colors hover:text-foreground',
        active ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {label}
      <Icon className="h-3 w-3" />
    </button>
  )
}

export function InventoryTable({
  devices,
  sort,
  onSort,
  onAction,
  storeOptions = stores,
  permissions = { edit: true, sale: true, transfer: true },
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="scrollbar-thin overflow-x-auto">
        <Table className="min-w-[1000px] text-xs [&_td]:px-2 [&_td]:py-2.5 [&_th]:h-10 [&_th]:px-2">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Brand</TableHead>
              <TableHead>
                <SortHeader label="Model" sortKey="model" sort={sort} onSort={onSort} />
              </TableHead>
              <TableHead>Storage</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>
                <SortHeader label="Price" title="Purchase Price" sortKey="purchasePrice" sort={sort} onSort={onSort} />
              </TableHead>
              <TableHead>
                <SortHeader label="Store" sortKey="store" sort={sort} onSort={onSort} />
              </TableHead>
              <TableHead>
                <SortHeader label="Purchased" title="Purchase Date" sortKey="purchaseDate" sort={sort} onSort={onSort} />
              </TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Battery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-32 text-center text-sm text-muted-foreground">
                  No devices match the current search and filters.
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => {
                const sold = device.status === 'Sold'
                const store = storeOptions.find((item) => item.id === device.storeId)

                return (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BrandIcon brand={device.brand} className="h-7 w-7" />
                        <span className="whitespace-nowrap font-medium text-foreground">{device.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[105px]">
                        <p className="whitespace-nowrap font-medium text-foreground">{device.model}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{device.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{device.storage}</TableCell>
                    <TableCell>
                      <span className="block max-w-[82px] truncate text-muted-foreground" title={device.color}>
                        {device.color}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[10px] tracking-tight text-foreground">{device.imei}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium text-foreground">
                      {formatCurrency(device.purchasePrice)}
                    </TableCell>
                    <TableCell>
                      <span title={getStoreName(device.storeId, storeOptions)} className="font-medium text-foreground">
                        {store?.shortName ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatShortDate(device.purchaseDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap px-2 py-0.5 text-[10px]">
                        {device.condition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'whitespace-nowrap text-[11px] font-medium',
                          device.batteryHealth < 85 ? 'text-warning' : 'text-foreground',
                        )}
                      >
                        {device.batteryHealth}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="[&>div]:px-2 [&>div]:py-0.5 [&>div]:text-[10px]">
                        <StockStatusBadge status={device.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Device actions">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onAction('view', device)}>View details</DropdownMenuItem>
                          {permissions.edit && (
                            <DropdownMenuItem onSelect={() => onAction('edit', device)}>Edit details</DropdownMenuItem>
                          )}
                          {(permissions.sale || permissions.transfer || permissions.edit) && <DropdownMenuSeparator />}
                          {permissions.sale && (
                            <DropdownMenuItem disabled={sold} onSelect={() => onAction('sale', device)}>
                              Record sale
                            </DropdownMenuItem>
                          )}
                          {permissions.transfer && (
                            <DropdownMenuItem disabled={sold} onSelect={() => onAction('transfer', device)}>
                              Transfer to another store
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onSelect={() => onAction('history', device)}>View stock history</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
