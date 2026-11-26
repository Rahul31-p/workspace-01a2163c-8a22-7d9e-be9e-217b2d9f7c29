import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function StoreComparisonCard({
  title,
  description,
  data,
  metric,
  formatValue,
  formatAxisValue,
  selectedStoreId,
  barColor = 'hsl(var(--brand-soft))',
  selectedColor = 'hsl(var(--brand))',
}) {
  const selected = data.find((item) => item.isSelected)
  const summaryValue = selected
    ? selected[metric]
    : data.reduce((sum, item) => sum + item[metric], 0)

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Badge variant="secondary">{formatValue(summaryValue)}</Badge>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, left: -12, bottom: 0 }}
              barSize={18}
            >
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={formatAxisValue}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                width={34}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--surface-low))' }}
                formatter={(value) => formatValue(value)}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid hsl(var(--border))',
                  boxShadow: '0 8px 24px hsl(var(--ink) / 0.08)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey={metric} radius={[0, 5, 5, 0]} isAnimationActive={false}>
                {data.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={
                      entry.isSelected || (!selectedStoreId || selectedStoreId === 'all')
                        ? selectedColor
                        : barColor
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {selected ? `Showing ${selected.name}` : 'All four PHONECLUB locations'}
        </p>
      </CardContent>
    </Card>
  )
}
