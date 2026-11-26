import { BadgeCheck, CalendarDays, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { allStoreOption } from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import { permissionLabels, roleCapabilities, roleLabels } from '@/data/permissions'

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-words text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function EmployeeDetailsModal({ open, onOpenChange, employee, stores, onEdit, onToggle }) {
  if (!employee) return null

  const storeName = employee.storeId === 'all'
    ? allStoreOption.name
    : getStoreName(employee.storeId, stores)
  const capabilities = roleCapabilities[employee.role] ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>{employee.name}</DialogTitle>
            <Badge variant={employee.role === 'super_admin' ? 'default' : employee.role === 'store_manager' ? 'secondary' : 'outline'}>
              {roleLabels[employee.role]}
            </Badge>
            <Badge variant={employee.status === 'Active' ? 'success' : 'secondary'}>{employee.status}</Badge>
          </div>
          <DialogDescription>
            {employee.title ?? roleLabels[employee.role]} · Added {employee.addedAt ?? '—'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Detail icon={Mail} label="Email" value={employee.email} />
          <Detail icon={Phone} label="Phone Number" value={employee.phone} />
          <Detail icon={MapPin} label="Assigned Store" value={storeName} />
          <Detail icon={UserRound} label="Role" value={roleLabels[employee.role]} />
          <Detail icon={CalendarDays} label="Account Status" value={employee.status} />
          <Detail icon={BadgeCheck} label="Sales Permission" value={employee.role === 'sales_executive' ? (employee.canRecordSales ? 'Permitted' : 'Not permitted') : 'Included in role'} />
        </div>

        <div className="rounded-lg border border-border p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            UI permissions for this role
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {capabilities.length ? (
              capabilities.map((capability) => (
                <Badge key={capability} variant="secondary" className="text-[10px]">
                  {permissionLabels[capability] ?? capability.replace(/([A-Z])/g, ' $1')}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No capabilities configured.</p>
            )}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            These permissions affect the browser UI only. Real security must be enforced by the backend.
          </p>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button
            variant={employee.status === 'Active' ? 'warning' : 'success'}
            onClick={onToggle}
          >
            {employee.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button onClick={onEdit}>Edit employee</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
