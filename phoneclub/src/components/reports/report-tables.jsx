import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/format'

function EmptyRow({ columns, message }) {
  return (
    <TableRow>
      <TableCell colSpan={columns} className="h-24 text-center text-xs text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  )
}

export function SalesBreakdownTable({ data, title, description }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[360px] overflow-auto rounded-lg border border-border">
          <Table className="text-xs [&_td]:px-3 [&_td]:py-2.5 [&_th]:px-3">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Gross profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length ? (
                [...data].reverse().map((row) => (
                  <TableRow key={row.label ?? row.month}>
                    <TableCell className="font-medium text-foreground">{row.label}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.units)}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell className="text-right text-success">{formatCurrency(row.profit)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <EmptyRow columns={4} message="No sales in the selected period." />
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function InventoryBreakdownTable({ data, title, description, valueLabel = 'Purchase value' }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[360px] overflow-auto rounded-lg border border-border">
          <Table className="text-xs [&_td]:px-3 [&_td]:py-2.5 [&_th]:px-3">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Mobiles</TableHead>
                <TableHead className="text-right">{valueLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length ? (
                data.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.units)}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">{formatCurrency(row.value)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <EmptyRow columns={3} message="No devices purchased in the selected period." />
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function StoreComparisonTable({ data }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Store comparison detail</CardTitle>
        <CardDescription>Revenue and inventory value use the same shared records as the dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border">
          <Table className="min-w-[720px] text-xs [&_td]:px-3 [&_td]:py-3 [&_th]:h-10 [&_th]:px-3">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Store</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Units sold</TableHead>
                <TableHead className="text-right">Gross profit</TableHead>
                <TableHead className="text-right">Inventory value</TableHead>
                <TableHead className="text-right">Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <span className="font-medium text-foreground">{store.name}</span>
                    <Badge variant="secondary" className="ml-2">{store.shortName}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-success">{formatCurrency(store.revenue)}</TableCell>
                  <TableCell className="text-right">{formatNumber(store.units)}</TableCell>
                  <TableCell className="text-right font-medium text-foreground">{formatCurrency(store.grossProfit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(store.inventoryValue)}</TableCell>
                  <TableCell className="text-right">{formatNumber(store.available)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
