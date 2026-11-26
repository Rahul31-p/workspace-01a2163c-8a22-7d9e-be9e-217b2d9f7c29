import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeftRight,
  Bell,
  ChevronDown,
  LifeBuoy,
  Menu,
  PackagePlus,
  Search,
  Settings,
  ShoppingCart,
  Smartphone,
  UserRound,
} from 'lucide-react'
import { allNavItems } from '@/config/navigation'
import { roleLabels } from '@/data/permissions'
import { useRole } from '@/context/role-context'
import { useToast } from '@/context/toast-context'
import { StoreSelector } from '@/components/common/store-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getPageTitle(pathname) {
  const exact = allNavItems.find((item) => item.path === pathname)
  if (exact) return exact.label

  const partial = allNavItems.find((item) => pathname.startsWith(`${item.path}/`))
  return partial?.label ?? 'Dashboard'
}

export function Header({ onOpenMobileNav }) {
  const location = useLocation()
  const navigate = useNavigate()
  const title = getPageTitle(location.pathname)
  const { user, activeUsers, selectUser } = useRole()
  const { toast } = useToast()
  const [globalQuery, setGlobalQuery] = useState('')

  const handleGlobalSearch = (event) => {
    event.preventDefault()
    const term = globalQuery.trim()
    navigate(term ? `/inventory?q=${encodeURIComponent(term)}` : '/inventory')
    setGlobalQuery('')
  }

  const switchUser = (nextUser) => {
    if (nextUser.id === user.id) return
    selectUser(nextUser.id)
    toast({
      title: `Now viewing as ${roleLabels[nextUser.role]}`,
      description: 'UI permissions changed. Server-side authorization is not part of this demo.',
      variant: 'info',
    })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur-sm sm:gap-3 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu />
      </Button>

      <div className="flex shrink-0 items-center gap-2 sm:border-r sm:border-border sm:pr-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-sm">
          <Smartphone className="h-4 w-4" />
        </span>
        <span className="hidden text-sm font-bold tracking-tight text-foreground sm:block">PHONECLUB</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        <p className="hidden truncate text-xs text-muted-foreground xl:block">Mobile retail inventory workspace</p>
      </div>

      <StoreSelector />

      <form
        role="search"
        aria-label="Global inventory search"
        onSubmit={handleGlobalSearch}
        className="relative hidden w-full max-w-56 xl:block"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-9 pl-9"
          placeholder="Search inventory, IMEI, model..."
          aria-label="Global search"
          value={globalQuery}
          onChange={(event) => setGlobalQuery(event.target.value)}
        />
      </form>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative shrink-0" aria-label="Notifications">
            <Bell />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warning ring-2 ring-surface" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <PackagePlus />
            New stock received at Connaught Place
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <ShoppingCart />
            Sale recorded for iPhone 15 Pro
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <ArrowLeftRight />
            Transfer awaiting confirmation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto shrink-0 gap-2 rounded-lg px-1.5 py-1.5" aria-label="Switch demo role">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user.initials}
            </span>
            <span className="hidden text-left 2xl:block">
              <span className="block text-xs font-semibold leading-tight text-foreground">{user.name}</span>
              <span className="block text-[11px] leading-tight text-muted-foreground">{roleLabels[user.role]}</span>
            </span>
            <ChevronDown className="hidden text-muted-foreground sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Demo role · UI only</DropdownMenuLabel>
          <p className="px-2.5 pb-2 text-[11px] leading-relaxed text-muted-foreground">
            Switch mock users to preview store and action permissions. This is not server-side authorization.
          </p>
          <DropdownMenuSeparator />
          {activeUsers.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => switchUser(item)}
              className="flex-col items-start gap-0.5"
              aria-current={item.id === user.id ? 'true' : undefined}
            >
              <span className="flex w-full items-center justify-between gap-2 text-xs font-medium text-foreground">
                {item.name}
                {item.id === user.id && <span className="text-[10px] font-semibold text-primary">Active</span>}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {roleLabels[item.role]} · {item.storeId === 'all' ? 'All Stores' : item.storeId.toUpperCase()}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <UserRound />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/help">
              <LifeBuoy />
              Help &amp; Support
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
