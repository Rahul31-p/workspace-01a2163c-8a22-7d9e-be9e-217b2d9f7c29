import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Smartphone, X } from 'lucide-react'
import { navigation } from '@/config/navigation'
import { isRouteAllowed } from '@/data/permissions'
import { useRole } from '@/context/role-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function Sidebar({ collapsed = false, onToggle, onNavigate, mobile = false }) {
  const compact = collapsed && !mobile
  const { user } = useRole()

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-surface',
        !mobile && 'transition-[width] duration-200 ease-in-out',
        compact ? 'w-[76px]' : 'w-64',
        mobile && 'w-72 max-w-[85vw]',
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-sm">
          <Smartphone className="h-5 w-5" />
        </div>
        {!compact && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-foreground">PHONECLUB</p>
            <p className="text-[11px] text-muted-foreground">Inventory suite</p>
          </div>
        )}
        {mobile && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={onNavigate} aria-label="Close navigation">
            <X />
          </Button>
        )}
      </div>

      <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navigation.map((group) => (
          <div key={group.label}>
            {!compact && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.filter((item) => isRouteAllowed(user, item.path)).map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    title={compact ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-surface-low hover:text-foreground',
                        compact && 'justify-center px-0',
                      )
                    }
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!compact && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        {!compact ? (
          <div className="rounded-lg bg-surface-low p-3">
            <p className="text-xs font-semibold text-foreground">Need a hand?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Guides and support are available in Help &amp; Support.
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-2 text-muted-foreground">
            <Smartphone className="h-5 w-5" />
          </div>
        )}

        {!mobile && (
          <Button
            variant="ghost"
            className={cn('mt-2 w-full justify-start text-muted-foreground', compact && 'justify-center px-0')}
            onClick={onToggle}
            aria-label={compact ? 'Expand sidebar' : 'Collapse sidebar'}
            title={compact ? 'Expand sidebar' : undefined}
          >
            {compact ? <ChevronRight /> : <ChevronLeft />}
            {!compact && <span>Collapse sidebar</span>}
          </Button>
        )}
      </div>
    </aside>
  )
}
