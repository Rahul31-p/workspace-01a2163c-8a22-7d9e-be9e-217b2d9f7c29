import { tableFeatures, useTable } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

// Keep table configuration outside the component so row models stay stable.
const features = tableFeatures({})
const EMPTY_DATA = []

/**
 * Thin, styled wrapper around TanStack Table.
 * Pass module-scope (or memoized) column definitions and data.
 */
export function DataTable({ columns, data = EMPTY_DATA, className, emptyMessage = 'No records found.' }) {
  const table = useTable({ features, columns, data })
  const rows = table.getRowModel().rows

  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-surface shadow-card', className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-28 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
