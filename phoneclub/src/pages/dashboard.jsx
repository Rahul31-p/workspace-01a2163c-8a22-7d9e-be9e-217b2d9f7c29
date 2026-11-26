import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, PackageCheck, Plus, Smartphone, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { StatCard } from '@/components/common/stat-card'
import { RecentActivitiesCard } from '@/components/dashboard/recent-activities-card'
import { RevenueOverviewCard } from '@/components/dashboard/revenue-overview-card'
import { DailySalesCard } from '@/components/dashboard/daily-sales-card'
import { StoreComparisonCard } from '@/components/dashboard/store-comparison-card'
import { WeeklySalesChart } from '@/components/dashboard/weekly-sales-chart'
import { Button } from '@/components/ui/button'
import { useBusinessData } from '@/context/business-context'
import { useStore } from '@/context/store-context'
import { MOCK_NOW } from '@/data/mockData'
import { buildActivities } from '@/data/activities'
import {
  getDailySales,
  getDashboardMetrics,
  getRevenueByBrand,
  getStoreInventoryComparison,
  getStoreSalesComparison,
  getWeeklySales,
  matchesStore,
} from '@/data/selectors'
import { formatCompactCurrency, formatCurrency, formatNumber, formatSignedPercent } from '@/lib/format'

export default function DashboardPage() {
  const { storeId, store } = useStore()
  const { devices, salesRecords, transferRecords, updateRecords, stores } = useBusinessData()

  const metrics = useMemo(
    () => getDashboardMetrics({ inventory: devices, sales: salesRecords, transfers: transferRecords, storeId }),
    [devices, salesRecords, transferRecords, storeId],
  )
  const weeklySales = useMemo(() => getWeeklySales(salesRecords, storeId), [salesRecords, storeId])
  const dailySales = useMemo(() => getDailySales(salesRecords, storeId), [salesRecords, storeId])
  const inventoryComparison = useMemo(
    () => getStoreInventoryComparison(devices, storeId, stores),
    [devices, storeId, stores],
  )
  const salesComparison = useMemo(
    () => getStoreSalesComparison(salesRecords, storeId, stores),
    [salesRecords, storeId, stores],
  )
  const revenueByBrand = useMemo(() => getRevenueByBrand(salesRecords, storeId), [salesRecords, storeId])

  const allActivities = useMemo(
    () =>
      buildActivities({
        inventory: devices,
        sales: salesRecords,
        transfers: transferRecords,
        inventoryUpdates: updateRecords,
        stores,
      }),
    [devices, salesRecords, transferRecords, updateRecords, stores],
  )
  const scopedActivities = useMemo(
    () => allActivities.filter((activity) => matchesStore(activity, storeId)),
    [allActivities, storeId],
  )

  const changeVariant = (value) => (value >= 0 ? 'success' : 'destructive')

  const stats = [
    {
      title: 'Total Inventory',
      value: formatNumber(metrics.totalInventory),
      icon: Smartphone,
      tone: 'primary',
      change: formatSignedPercent(metrics.changes.totalInventory),
      changeVariant: changeVariant(metrics.changes.totalInventory),
      footnote: `Across ${storeId === 'all' ? stores.length : 1} location${storeId === 'all' ? 's' : ''}`,
    },
    {
      title: 'Available Stock',
      value: formatNumber(metrics.availableStock),
      icon: PackageCheck,
      tone: 'success',
      change: formatSignedPercent(metrics.changes.availableStock),
      changeVariant: changeVariant(metrics.changes.availableStock),
      footnote: `${metrics.reservedStock} reserved · ${metrics.transitStock} in transit`,
    },
    {
      title: 'Units Sold',
      value: formatNumber(metrics.unitsSold),
      icon: BarChart3,
      tone: 'primary',
      change: formatSignedPercent(metrics.changes.unitsSold),
      changeVariant: changeVariant(metrics.changes.unitsSold),
      footnote: 'Last 7 days',
    },
    {
      title: 'Total Sales Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: Wallet,
      tone: 'warning',
      change: formatSignedPercent(metrics.changes.totalRevenue),
      changeVariant: changeVariant(metrics.changes.totalRevenue),
      footnote: 'Compared with previous week',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          storeId === 'all'
            ? 'Complete business overview across all PHONECLUB locations.'
            : `Business overview for the ${store.name} store.`
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/reports">View reports</Link>
            </Button>
            <Button asChild>
              <Link to="/add-stock">
                <Plus />
                Add new stock
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklySalesChart
            data={weeklySales}
            totalRevenue={metrics.totalRevenue}
            unitsSold={metrics.unitsSold}
            averageOrderValue={metrics.averageOrderValue}
          />
        </div>
        <DailySalesCard data={dailySales} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StoreComparisonCard
          title="Store-wise inventory"
          description="Device count by location"
          data={inventoryComparison}
          metric="total"
          selectedStoreId={storeId}
          formatValue={formatNumber}
          formatAxisValue={(value) => `${value}`}
        />
        <StoreComparisonCard
          title="Store-wise sales"
          description="Revenue contribution by location"
          data={salesComparison}
          metric="revenue"
          selectedStoreId={storeId}
          formatValue={formatCompactCurrency}
          formatAxisValue={formatCompactCurrency}
          barColor="hsl(var(--brand-soft))"
          selectedColor="hsl(var(--success))"
        />
        <RevenueOverviewCard data={revenueByBrand} averageOrderValue={metrics.averageOrderValue} />
      </div>

      <RecentActivitiesCard activities={scopedActivities} referenceTime={MOCK_NOW} />
    </div>
  )
}
