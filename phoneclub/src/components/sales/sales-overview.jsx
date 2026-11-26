import { PackageCheck, ReceiptText, Smartphone, TrendingUp, Wallet } from 'lucide-react'
import { StatCard } from '@/components/common/stat-card'
import { formatCurrency, formatNumber } from '@/lib/format'

export function SalesOverview({ metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        title="Total transactions"
        value={formatNumber(metrics.totalTransactions)}
        icon={ReceiptText}
        footnote="Sales recorded in scope"
      />
      <StatCard
        title="Total revenue"
        value={formatCurrency(metrics.totalRevenue)}
        icon={Wallet}
        tone="success"
        footnote="Selling price total"
      />
      <StatCard
        title="Total gross profit"
        value={formatCurrency(metrics.totalGrossProfit)}
        icon={TrendingUp}
        footnote="Revenue minus purchase cost"
      />
      <StatCard
        title="Average selling price"
        value={formatCurrency(metrics.averageSellingPrice)}
        icon={PackageCheck}
        tone="warning"
        footnote="Per mobile sold"
      />
      <StatCard
        title="Mobiles sold"
        value={formatNumber(metrics.mobilesSold)}
        icon={Smartphone}
        footnote="Individual devices"
      />
    </div>
  )
}
