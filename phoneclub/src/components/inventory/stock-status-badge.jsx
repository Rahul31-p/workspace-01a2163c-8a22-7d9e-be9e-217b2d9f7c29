import { Badge } from '@/components/ui/badge'

const variants = {
  'In Stock': 'success',
  Sold: 'secondary',
  Reserved: 'warning',
  Returned: 'outline',
  Transferred: 'default',
}

export function StockStatusBadge({ status }) {
  return <Badge variant={variants[status] ?? 'secondary'}>{status}</Badge>
}
