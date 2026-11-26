import { Smartphone } from 'lucide-react'
import { brandColors } from '@/data/mockData'
import { cn } from '@/lib/utils'

export function BrandIcon({ brand, className }) {
  const color = brandColors[brand] ?? '#6e6e73'

  return (
    <span
      className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', className)}
      style={{ backgroundColor: `${color}14`, color }}
      aria-hidden="true"
    >
      <Smartphone className="h-4 w-4" />
    </span>
  )
}
