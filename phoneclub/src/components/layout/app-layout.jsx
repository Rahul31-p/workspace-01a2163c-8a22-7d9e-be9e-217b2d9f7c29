import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Header } from './header'
import { MobileNav } from './mobile-nav'
import { Sidebar } from './sidebar'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <div
          className={cn(
            'hidden lg:fixed lg:inset-y-0 lg:z-40 lg:block',
            collapsed ? 'lg:w-[76px]' : 'lg:w-64',
          )}
        >
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
        </div>

        <div className={cn('flex min-h-screen w-full flex-col', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
          <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </div>
  )
}
