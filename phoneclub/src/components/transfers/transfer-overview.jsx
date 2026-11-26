import { ArrowLeftRight, CheckCircle2, PackageCheck, Truck } from 'lucide-react'
import { StatCard } from '@/components/common/stat-card'
import { formatNumber } from '@/lib/format'

export function TransferOverview({ metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total transfers"
        value={formatNumber(metrics.totalTransfers)}
        icon={ArrowLeftRight}
        footnote="Movements in this scope"
      />
      <StatCard
        title="Completed"
        value={formatNumber(metrics.completed)}
        icon={CheckCircle2}
        tone="success"
        footnote="Stock moved and recorded"
      />
      <StatCard
        title="In transit"
        value={formatNumber(metrics.inTransit)}
        icon={Truck}
        tone="warning"
        footnote="Awaiting confirmation"
      />
      <StatCard
        title="Unique devices"
        value={formatNumber(metrics.uniqueDevices)}
        icon={PackageCheck}
        footnote="No duplicate records created"
      />
    </div>
  )
}
