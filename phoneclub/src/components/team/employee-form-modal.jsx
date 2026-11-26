import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { validateEmployeeForm } from '@/data/employeeSelectors'
import { roleLabels, roles } from '@/data/permissions'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  title: '',
  role: 'sales_executive',
  storeId: '',
  status: 'Active',
  canRecordSales: true,
}

export function EmployeeFormModal({ open, onOpenChange, employee, users, stores, onSubmit }) {
  const [form, setForm] = useState(() =>
    employee
      ? {
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          title: employee.title ?? '',
          role: employee.role,
          storeId: employee.storeId,
          status: employee.status,
          canRecordSales: Boolean(employee.canRecordSales),
        }
      : { ...emptyForm, storeId: stores[0]?.id ?? '' },
  )
  const [errors, setErrors] = useState({})

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  const updateRole = (role) => {
    setForm((current) => ({
      ...current,
      role,
      storeId: role === 'super_admin' ? 'all' : current.storeId === 'all' ? stores[0]?.id ?? '' : current.storeId,
      canRecordSales: role === 'sales_executive' ? current.canRecordSales : true,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateEmployeeForm(form, users, employee?.id)

    setErrors(nextErrors)
    if (Object.keys(nextErrors).some((key) => nextErrors[key])) return

    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit employee' : 'Add employee'}</DialogTitle>
          <DialogDescription>
            Employee records drive the mock role switcher and UI permission simulation across the app.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block" htmlFor="employee-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="employee-name"
              aria-label="Full Name"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="e.g. Ananya Verma"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          <div>
            <Label className="mb-1.5 block" htmlFor="employee-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="employee-email"
              aria-label="Email"
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              placeholder="name@phoneclub.in"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>

          <div>
            <Label className="mb-1.5 block" htmlFor="employee-phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="employee-phone"
              aria-label="Phone Number"
              inputMode="numeric"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit number"
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div>
            <Label className="mb-1.5 block" htmlFor="employee-title">
              Job Title
            </Label>
            <Input
              id="employee-title"
              aria-label="Job Title"
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="e.g. Senior Sales Executive"
            />
          </div>

          <div>
            <Label className="mb-1.5 block">Role <span className="text-destructive">*</span></Label>
            <Select value={form.role} onValueChange={updateRole}>
              <SelectTrigger aria-label="Role" aria-invalid={Boolean(errors.role)}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleLabels[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role}</p>}
          </div>

          <div>
            <Label className="mb-1.5 block">Assigned Store <span className="text-destructive">*</span></Label>
            <Select
              value={form.storeId}
              onValueChange={(value) => update('storeId', value)}
              disabled={form.role === 'super_admin'}
            >
              <SelectTrigger aria-label="Assigned Store" aria-invalid={Boolean(errors.storeId)}>
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {form.role === 'super_admin' ? (
                  <SelectItem value="all">All Stores</SelectItem>
                ) : (
                  stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.storeId && <p className="mt-1 text-xs text-destructive">{errors.storeId}</p>}
          </div>

          <div>
            <Label className="mb-1.5 block">Account Status</Label>
            <Select value={form.status} onValueChange={(value) => update('status', value)}>
              <SelectTrigger aria-label="Account Status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.role === 'sales_executive' && (
            <label className="flex h-10 items-center gap-2 rounded-lg border border-input bg-surface px-3 text-sm text-foreground sm:col-span-2">
              <Checkbox
                aria-label="Can record sales"
                checked={form.canRecordSales}
                onChange={(event) => update('canRecordSales', event.target.checked)}
              />
              Permit this Sales Executive to record sales
            </label>
          )}

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{employee ? 'Save changes' : 'Add employee'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
