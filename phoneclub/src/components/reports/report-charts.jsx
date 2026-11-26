import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactCurrency, formatCurrency, formatNumber } from '@/lib/format'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid hsl(var(--border))',
  boxShadow: '0 8px 24px hsl(var(--ink) / 0.08)',
  fontSize: 12,
}

function EmptyChart({ label = 'No data in the selected period.' }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
      {label}
    </div>
  )
}

export function WeeklySalesBarChart({ data }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Weekly sales</CardTitle>
        <CardDescription>Daily buckets for short ranges, weekly buckets for longer ranges</CardDescription>
      </CardHeader>
      <CardContent>
        {data.every((item) => item.revenue === 0) ? (
          <EmptyChart />
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={formatCompactCurrency}
                  width={64}
                />
                <Tooltip
                  formatter={(value, name) => (name === 'Revenue' ? formatCurrency(value) : formatNumber(value))}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--brand))" radius={[5, 5, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function RevenueAreaChart({ data }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Revenue area</CardTitle>
        <CardDescription>Daily and cumulative revenue in the selected range</CardDescription>
      </CardHeader>
      <CardContent>
        {data.every((item) => item.cumulative === 0) ? (
          <EmptyChart />
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={formatCompactCurrency}
                  width={64}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative revenue"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  fill="url(#reportRevenueFill)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StoreComparisonChart({ data }) {
  const chartData = data.map((store) => ({ name: store.shortName, revenue: store.revenue, units: store.units }))

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Store comparison</CardTitle>
        <CardDescription>Revenue by store in the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.every((item) => item.revenue === 0) ? (
          <EmptyChart />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={formatCompactCurrency}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  width={40}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={tooltipStyle} />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[0, 5, 5, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function BrandInventoryChart({ data }) {
  const chartData = data.slice(0, 8).map((brand) => ({ name: brand.name, units: brand.units }))

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Brand-wise inventory</CardTitle>
        <CardDescription>Devices purchased in the selected range, by brand</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip formatter={(value) => formatNumber(value)} contentStyle={tooltipStyle} />
                <Bar dataKey="units" name="Devices" fill="hsl(var(--warning))" radius={[5, 5, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
