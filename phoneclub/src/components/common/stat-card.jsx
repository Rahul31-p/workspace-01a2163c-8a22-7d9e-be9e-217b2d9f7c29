import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const tones = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
}

const badgeTones = {
  primary: 'default',
  success: 'success',
  warning: 'warning',
}

export function StatCard({ title, value, icon: Icon, tone = 'primary', change, changeVariant, footnote }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(change || footnote) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {change && <Badge variant={changeVariant ?? badgeTones[tone]}>{change}</Badge>}
          {footnote && <span className="text-muted-foreground">{footnote}</span>}
        </div>
      )}
    </Card>
  )
}
