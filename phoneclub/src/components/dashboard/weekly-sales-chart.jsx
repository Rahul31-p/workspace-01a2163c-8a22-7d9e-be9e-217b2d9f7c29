import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCompactCurrency, formatCurrency, formatNumber } from '@/lib/format'

export function WeeklySalesChart({ data, totalRevenue, unitsSold, averageOrderValue }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Weekly sales</CardTitle>
          <CardDescription>Revenue and units sold over the last 7 days</CardDescription>
        </div>
        <Badge variant="secondary">Last 7 days</Badge>
      </CardHeader>

      <CardContent>
        <div className="mb-5 grid grid-cols-3 gap-3 border-y border-border py-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Revenue</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{formatCompactCurrency(totalRevenue)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Units sold</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{formatNumber(unitsSold)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Avg. order</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{formatCompactCurrency(averageOrderValue)}</p>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="weeklySalesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={formatCompactCurrency}
                width={62}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 8px 24px hsl(var(--ink) / 0.08)',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="hsl(var(--brand))"
                strokeWidth={2}
                fill="url(#weeklySalesFill)"
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
