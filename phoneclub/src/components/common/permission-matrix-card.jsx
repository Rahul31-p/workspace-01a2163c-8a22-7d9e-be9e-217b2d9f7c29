import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { permissionLabels, permissionMatrix, roleDescriptions, roleLabels } from '@/data/permissions'
import { useRole } from '@/context/role-context'
import { cn } from '@/lib/utils'

function PermissionValue({ value }) {
  if (value === true) return <Badge variant="success">Allowed</Badge>
  if (value === 'If permitted') return <Badge variant="warning">If permitted</Badge>
  return <span className="text-xs text-muted-foreground">—</span>
}

export function PermissionMatrixCard({
  title = 'Access roles',
  description,
}) {
  const { user } = useRole()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description ?? `UI-only permission preview. Active demo user: ${user.name} · ${roleLabels[user.role]}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(roleLabels).map(([role, label]) => (
            <div
              key={role}
              className={cn(
                'rounded-lg border p-3',
                role === user.role ? 'border-primary/30 bg-primary/5' : 'border-border',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">{label}</p>
                {role === user.role && <Badge>Active</Badge>}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{roleDescriptions[role]}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="scrollbar-thin overflow-x-auto">
            <Table className="min-w-[560px] text-xs [&_td]:px-3 [&_td]:py-2.5 [&_th]:h-10 [&_th]:px-3">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Permission</TableHead>
                  <TableHead>Super Admin</TableHead>
                  <TableHead>Store Manager</TableHead>
                  <TableHead>Sales Executive</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissionMatrix.map((row) => (
                  <TableRow key={row.capability}>
                    <TableCell className="font-medium text-foreground">{permissionLabels[row.capability]}</TableCell>
                    <TableCell><PermissionValue value={row.super_admin} /></TableCell>
                    <TableCell><PermissionValue value={row.store_manager} /></TableCell>
                    <TableCell><PermissionValue value={row.sales_executive} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <p className="flex items-start gap-2 rounded-lg bg-surface-low p-3 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          These controls demonstrate frontend gating only. A real deployment must enforce the same rules on the server
          for every API request.
        </p>
      </CardContent>
    </Card>
  )
}
