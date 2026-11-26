import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRelativeTime } from '@/lib/format'

const categoryVariants = {
  Inventory: 'secondary',
  Sales: 'success',
  Transfer: 'warning',
}

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'Added', label: 'Added' },
  { value: 'Sold', label: 'Sold' },
  { value: 'Transfer', label: 'Transfers' },
  { value: 'Update', label: 'Updates' },
]

const columnHelper = createColumnHelper()

function makeColumns(referenceTime) {
  return [
    columnHelper.accessor('timestamp', {
      header: 'Time',
      cell: (info) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatRelativeTime(info.getValue(), referenceTime)}
        </span>
      ),
    }),
    columnHelper.accessor('title', {
      header: 'Activity',
      cell: (info) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">{info.getValue()}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{info.row.original.detail}</p>
        </div>
      ),
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => <Badge variant={categoryVariants[info.getValue()]}>{info.getValue()}</Badge>,
    }),
    columnHelper.accessor('storeName', {
      header: 'Store',
      cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor('user', {
      header: 'User',
      cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              info.getValue() === 'Completed' || info.getValue() === 'In Stock' ? 'bg-success' : 'bg-warning'
            }`}
          />
          {info.getValue()}
        </span>
      ),
    }),
  ]
}

export function RecentActivitiesCard({ activities, referenceTime, limit = 8 }) {
  const [activeTab, setActiveTab] = useState('all')
  const columns = useMemo(() => makeColumns(referenceTime), [referenceTime])

  const visibleActivities = useMemo(() => {
    const filtered = activeTab === 'all' ? activities : activities.filter((item) => item.type === activeTab)
    return filtered.slice(0, limit)
  }, [activities, activeTab, limit])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Recent activities</CardTitle>
            <CardDescription>
              Added, sold, transferred, and updated records from across the selected scope
            </CardDescription>
          </div>
          <TabsList className="scrollbar-thin max-w-full overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <TabsContent value={activeTab} className="mt-0">
            <DataTable
              columns={columns}
              data={visibleActivities}
              emptyMessage="No activity records in this category."
              className="rounded-none border-0 shadow-none"
            />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  )
}
