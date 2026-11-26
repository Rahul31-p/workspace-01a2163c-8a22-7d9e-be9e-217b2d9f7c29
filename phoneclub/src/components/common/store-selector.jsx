import { Store } from 'lucide-react'
import { useStore } from '@/context/store-context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function StoreSelector() {
  const { storeId, setStoreId, stores } = useStore()

  return (
    <Select value={storeId} onValueChange={setStoreId}>
      <SelectTrigger
        aria-label="Select store"
        chevronClassName="hidden sm:block"
        className="h-9 w-9 justify-center border-border bg-surface px-0 text-xs font-medium shadow-sm sm:w-44 sm:justify-between sm:px-3 lg:w-48"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Store className="h-4 w-4 shrink-0 text-primary" />
          <span className="hidden min-w-0 sm:block">
            <SelectValue placeholder="Select store" />
          </span>
        </span>
      </SelectTrigger>
      <SelectContent align="end">
        {stores.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            {store.name}
            {store.status === 'Inactive' ? ' (Inactive)' : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
