import { useState } from 'react'
import { ChevronDown, ChevronUp, MapPin, Pencil, Phone, Store, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/format'

export function StoreCard({ store, overview, canManage, onView, onEdit, onToggle }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden p-0" data-store-name={store.name}>
      <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-low/70 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-foreground">{store.name}</h3>
              <Badge variant={store.status === 'Active' ? 'success' : 'secondary'}>{store.status}</Badge>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{store.code}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setExpanded((value) => !value)}
          aria-label={expanded ? `Collapse ${store.name}` : `Expand ${store.name}`}
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{store.address}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <UserRound className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{store.manager}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {store.contact}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          <div className="rounded-lg bg-surface-low p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Available mobiles</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{formatNumber(overview.available)}</p>
          </div>
          <div className="rounded-lg bg-surface-low p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Mobiles sold</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{formatNumber(overview.sold)}</p>
          </div>
          <div className="rounded-lg bg-surface-low p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Purchase value</p>
            <p className="mt-1 text-xs font-semibold text-foreground">{formatCurrency(overview.purchaseValue)}</p>
          </div>
          <div className="rounded-lg bg-surface-low p-2.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sales revenue</p>
            <p className="mt-1 text-xs font-semibold text-success">{formatCurrency(overview.revenue)}</p>
          </div>
        </div>

        {expanded && (
          <div className="rounded-lg border border-border p-3">
            <p className="text-[11px] font-semibold text-foreground">
              Assigned employees ({overview.employees.length})
            </p>
            <div className="mt-2 space-y-1.5">
              {overview.employees.length ? (
                overview.employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-medium text-foreground">{employee.name}</span>
                    <span className="capitalize text-muted-foreground">{employee.role.replace('_', ' ')}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-muted-foreground">No mock users assigned.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onView}>
            View store
          </Button>
          {canManage && (
            <>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Pencil />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={store.status === 'Active' ? 'text-destructive' : 'text-success'}
                onClick={onToggle}
              >
                {store.status === 'Active' ? 'Deactivate' : 'Activate'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
