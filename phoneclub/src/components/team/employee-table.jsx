import { MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { allStoreOption } from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import { roleLabels } from '@/data/permissions'

const roleVariants = {
  super_admin: 'default',
  store_manager: 'secondary',
  sales_executive: 'outline',
}

export function EmployeeTable({ users, stores, onAction }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="scrollbar-thin overflow-x-auto">
        <Table className="min-w-[860px] text-xs [&_td]:px-3 [&_td]:py-3 [&_th]:h-11 [&_th]:px-3">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Employee</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Store</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-sm text-muted-foreground">
                  No employees match the current search and filters.
                </TableCell>
              </TableRow>
            ) : (
              users.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {employee.initials}
                      </span>
                      <span>
                        <span className="block font-medium text-foreground">{employee.name}</span>
                        <span className="block text-[11px] text-muted-foreground">{employee.title ?? '—'}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{employee.email}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-[11px]">{employee.phone}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariants[employee.role] ?? 'secondary'} className="whitespace-nowrap">
                      {roleLabels[employee.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {employee.storeId === 'all'
                      ? allStoreOption.name
                      : getStoreName(employee.storeId, stores)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'Active' ? 'success' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Employee actions">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onAction('view', employee)}>View details</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onAction('edit', employee)}>Edit employee</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={employee.status === 'Active' ? 'text-destructive' : 'text-success'}
                          onSelect={() => onAction('toggle', employee)}
                        >
                          {employee.status === 'Active' ? 'Deactivate employee' : 'Activate employee'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
