import { useMemo, useState } from 'react'
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Package,
  Smartphone,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PermissionNotice, UiPermissionBanner } from '@/components/common/permission-notice'
import { StatCard } from '@/components/common/stat-card'
import {
  BrandInventoryChart,
  RevenueAreaChart,
  StoreComparisonChart,
  WeeklySalesBarChart,
} from '@/components/reports/report-charts'
import {
  InventoryBreakdownTable,
  SalesBreakdownTable,
  StoreComparisonTable,
} from '@/components/reports/report-tables'
import { ReportFilters } from '@/components/reports/report-filters'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBusinessData } from '@/context/business-context'
import { useRole } from '@/context/role-context'
import { useStore } from '@/context/store-context'
import { useToast } from '@/context/toast-context'
import { APP_TODAY } from '@/data/formOptions'
import { allStoreOption } from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import {
  filterInventoryForReport,
  filterSalesForReport,
  getBrandStock,
  getDailySalesSeries,
  getInventoryReportMetrics,
  getModelStock,
  getMonthlySalesSeries,
  getReportDateRange,
  getRevenueAreaSeries,
  getSalesReportMetrics,
  getStoreComparison,
  getWeeklySalesSeries,
} from '@/data/reportSelectors'
import { exportReportToExcel, exportReportToPdf } from '@/lib/reportExport'
import { formatCurrency, formatNumber } from '@/lib/format'

const initialCustomRange = { from: APP_TODAY, to: APP_TODAY }

export default function ReportsPage() {
  const { storeId, setStoreId, stores: scopeStores } = useStore()
  const { stores, devices, salesRecords } = useBusinessData()
  const { user, can } = useRole()
  const { toast } = useToast()

  const [preset, setPreset] = useState('this_week')
  const [customRange, setCustomRange] = useState(initialCustomRange)
  const range = useMemo(() => getReportDateRange(preset, customRange), [preset, customRange])

  const scopedSales = useMemo(
    () => filterSalesForReport(salesRecords, { range, storeId }),
    [salesRecords, range, storeId],
  )
  const scopedInventory = useMemo(
    () => filterInventoryForReport(devices, { range, storeId }),
    [devices, range, storeId],
  )

  const salesMetrics = useMemo(() => getSalesReportMetrics(scopedSales), [scopedSales])
  const inventoryMetrics = useMemo(() => getInventoryReportMetrics(scopedInventory), [scopedInventory])
  const daily = useMemo(() => getDailySalesSeries(scopedSales, range), [scopedSales, range])
  const weekly = useMemo(() => getWeeklySalesSeries(scopedSales, range), [scopedSales, range])
  const monthly = useMemo(() => getMonthlySalesSeries(scopedSales, range), [scopedSales, range])
  const revenueArea = useMemo(() => getRevenueAreaSeries(scopedSales, range), [scopedSales, range])
  const brandStock = useMemo(() => getBrandStock(scopedInventory), [scopedInventory])
  const modelStock = useMemo(() => getModelStock(scopedInventory), [scopedInventory])
  const storeRows = useMemo(
    () => getStoreComparison({ devices: scopedInventory, sales: scopedSales, storeOptions: scopeStores }),
    [scopedInventory, scopedSales, scopeStores],
  )

  const scopeName = storeId === 'all' ? allStoreOption.name : getStoreName(storeId, stores)

  const exportReport = (type) => {
    const report = {
      scope: scopeName,
      range,
      sales: scopedSales,
      inventory: scopedInventory,
      storeRows,
      salesMetrics,
      inventoryMetrics,
      storeOptions: stores,
    }

    if (type === 'excel') exportReportToExcel(report)
    else exportReportToPdf(report)

    toast({
      title: `${type === 'excel' ? 'Excel' : 'PDF'} report exported`,
      description: `${scopedSales.length} sales and ${scopedInventory.length} inventory records from the current filters.`,
      variant: 'success',
    })
  }

  const reset = () => {
    setPreset('this_week')
    setCustomRange(initialCustomRange)
    setStoreId('all')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description={`Performance across ${scopeName}, derived from shared inventory and sales records.`}
        actions={
          can('viewReports') ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download />
                  Export report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => exportReport('excel')}>
                  <FileSpreadsheet />
                  Export Excel
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => exportReport('pdf')}>
                  <FileText />
                  Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : undefined
        }
      />

      <UiPermissionBanner role={user.role} />

      {!can('viewReports') ? (
        <PermissionNotice
          title="Reports are not available for this role"
          description={`${user.name} can work with assigned-store stock and sales, but report views are reserved for Super Admins and Store Managers.`}
        />
      ) : (
        <>
          <ReportFilters
            preset={preset}
            onPresetChange={setPreset}
            range={range}
            customRange={customRange}
            onCustomChange={setCustomRange}
            storeId={storeId}
            stores={scopeStores}
            onStoreChange={setStoreId}
            resultCount={scopedSales.length}
            onReset={reset}
          />

          <Tabs defaultValue="sales" className="space-y-6">
            <TabsList>
              <TabsTrigger value="sales">Sales report</TabsTrigger>
              <TabsTrigger value="inventory">Inventory report</TabsTrigger>
              <TabsTrigger value="stores">Store comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total revenue"
                  value={formatCurrency(salesMetrics.totalRevenue)}
                  icon={Wallet}
                  tone="success"
                  footnote={range.label}
                />
                <StatCard
                  title="Total profit"
                  value={formatCurrency(salesMetrics.totalProfit)}
                  icon={TrendingUp}
                  footnote={`${salesMetrics.margin}% margin`}
                />
                <StatCard
                  title="Average selling price"
                  value={formatCurrency(salesMetrics.averageSellingPrice)}
                  icon={BarChart3}
                  tone="warning"
                  footnote="Per transaction"
                />
                <StatCard
                  title="Transactions"
                  value={formatNumber(salesMetrics.transactions)}
                  icon={Smartphone}
                  footnote="Filtered sales records"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <WeeklySalesBarChart data={weekly} />
                <RevenueAreaChart data={revenueArea} />
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <SalesBreakdownTable data={daily} title="Daily sales" description="One row per day in the range" />
                <SalesBreakdownTable data={weekly} title="Weekly sales" description="Daily or weekly buckets" />
                <SalesBreakdownTable data={monthly} title="Monthly sales" description="Grouped by calendar month" />
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard title="Mobiles purchased" value={formatNumber(inventoryMetrics.totalPurchased)} icon={Package} footnote="Matching purchase dates" />
                <StatCard title="Available mobiles" value={formatNumber(inventoryMetrics.available)} icon={Smartphone} tone="success" footnote="In Stock" />
                <StatCard title="Sold mobiles" value={formatNumber(inventoryMetrics.sold)} icon={BarChart3} footnote="Status Sold" />
                <StatCard title="Reserved mobiles" value={formatNumber(inventoryMetrics.reserved)} icon={Package} tone="warning" footnote="Status Reserved" />
                <StatCard title="Total purchase value" value={formatCurrency(inventoryMetrics.purchaseValue)} icon={Wallet} footnote="Cost of filtered devices" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <BrandInventoryChart data={brandStock} />
                <InventoryBreakdownTable
                  data={brandStock}
                  title="Brand-wise stock"
                  description="Device count and purchase value by brand"
                />
              </div>

              <InventoryBreakdownTable
                data={modelStock}
                title="Model-wise stock"
                description="Every brand and model combination in the filtered inventory"
              />
            </TabsContent>

            <TabsContent value="stores" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <StoreComparisonChart data={storeRows} />
                <StoreComparisonTable data={storeRows} />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
