import { CalendarRange, RotateCcw, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { reportPresets } from '@/data/reportSelectors'
import { formatNumber } from '@/lib/format'

export function ReportFilters({
  preset,
  onPresetChange,
  range,
  customRange,
  onCustomChange,
  storeId,
  stores,
  onStoreChange,
  resultCount,
  onReset,
}) {
  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Report period
          </Label>
          <Select value={preset} onValueChange={onPresetChange}>
            <SelectTrigger aria-label="Report period" className="h-9">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {reportPresets.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Store selection
          </Label>
          <Select value={storeId} onValueChange={onStoreChange}>
            <SelectTrigger aria-label="Report store" className="h-9">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                  {store.status === 'Inactive' ? ' (Inactive)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {preset === 'custom' ? (
          <>
            <div>
              <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                From date
              </Label>
              <Input
                aria-label="Report start date"
                type="date"
                value={customRange.from}
                onChange={(event) => onCustomChange({ ...customRange, from: event.target.value })}
                className="h-9"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                To date
              </Label>
              <Input
                aria-label="Report end date"
                type="date"
                value={customRange.to}
                onChange={(event) => onCustomChange({ ...customRange, to: event.target.value })}
                className="h-9"
              />
            </div>
          </>
        ) : (
          <div className="flex items-end xl:col-span-2">
            <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-low px-3 py-2 text-xs text-muted-foreground">
              <CalendarRange className="h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="font-medium text-foreground">{range.from}</strong> to{' '}
                <strong className="font-medium text-foreground">{range.to}</strong>
              </span>
            </div>
          </div>
        )}

        <div className="flex items-end justify-between gap-3 xl:justify-end">
          <span className="text-xs text-muted-foreground">
            <strong className="font-semibold text-foreground">{formatNumber(resultCount)}</strong> sales in range
          </span>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw />
            Reset
          </Button>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Store className="h-3.5 w-3.5" />
        Store selection here is the global selector; every page stays in the same scope.
      </p>
    </Card>
  )
}
