import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { brandColors } from '@/data/mockData'
import { formatCompactCurrency, formatCurrency } from '@/lib/format'

export function RevenueOverviewCard({ data, averageOrderValue }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const visibleBrands = data.slice(0, 5)
  const remaining = Math.max(0, data.length - visibleBrands.length)

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Revenue overview</CardTitle>
          <CardDescription>Sales contribution by device brand</CardDescription>
        </div>
        <Badge variant="secondary">{data.length} brands</Badge>
      </CardHeader>

      <CardContent>
        <div className="relative h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={54}
                outerRadius={78}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={brandColors[entry.name] ?? 'hsl(var(--muted-foreground))'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 8px 24px hsl(var(--ink) / 0.08)',
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[11px] font-medium text-muted-foreground">Total revenue</p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
              {formatCompactCurrency(total)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Avg. {formatCompactCurrency(averageOrderValue)}</p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {visibleBrands.map((brand) => (
            <div key={brand.name} className="flex items-center gap-2 text-xs">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: brandColors[brand.name] ?? 'hsl(var(--muted-foreground))' }}
              />
              <span className="flex-1 text-muted-foreground">{brand.name}</span>
              <span className="font-medium text-foreground">{formatCompactCurrency(brand.value)}</span>
            </div>
          ))}
          {remaining > 0 && <p className="pt-1 text-[11px] text-muted-foreground">+{remaining} more brands</p>}
        </div>
      </CardContent>
    </Card>
  )
}
