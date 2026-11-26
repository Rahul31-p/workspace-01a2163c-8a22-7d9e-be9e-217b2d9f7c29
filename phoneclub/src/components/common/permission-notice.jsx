import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { roleLabels } from '@/data/permissions'

export function PermissionNotice({ title = 'Restricted in this demo role', description, compact = false }) {
  return (
    <Card
      className={
        compact
          ? 'flex items-start gap-3 border-warning/30 bg-warning-soft/50 p-4'
          : 'flex flex-col items-center gap-3 p-10 text-center'
      }
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
        <LockKeyhole className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 max-w-lg text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </Card>
  )
}

export function UiPermissionBanner({ role }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        Showing <strong className="font-semibold text-foreground">{roleLabels[role] ?? role}</strong> permissions in the
        browser UI only. These checks are mock data and do not provide server-side authorization.
      </p>
    </div>
  )
}
