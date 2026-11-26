import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCompactCurrency, formatNumber } from '@/lib/format'

export function DailySalesCard({ data }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Daily sales statistics</CardTitle>
        <CardDescription>Newest day first, with revenue and units</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.map((day, index) => (
          <div
            key={day.date}
            className={cn(
              'flex items-center gap-3 rounded-lg px-2 py-2',
              index === 0 ? 'bg-primary/5' : 'hover:bg-surface-low',
            )}
          >
            <span className="w-9 shrink-0 text-xs font-semibold text-muted-foreground">{day.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
              <div
                className={cn('h-full rounded-full', index === 0 ? 'bg-primary' : 'bg-primary/40')}
                style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs font-semibold text-foreground">
              {formatCompactCurrency(day.revenue)}
            </span>
            <span className="w-10 shrink-0 text-right text-[11px] text-muted-foreground">
              {formatNumber(day.units)}u
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
