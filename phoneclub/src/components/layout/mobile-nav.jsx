import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Sidebar } from './sidebar'

export function MobileNav({ open, onOpenChange }) {
  const { pathname } = useLocation()

  useEffect(() => {
    onOpenChange(false)
  }, [pathname, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent drawer showClose={false} className="w-72 max-w-[85vw]">
        <DialogTitle className="sr-only">Navigation</DialogTitle>
        <Sidebar mobile onNavigate={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
