import { useMemo, useState } from 'react'
import { CircleCheck, Plus, RotateCcw, Search, ShieldCheck, UserRound, UserX } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PermissionMatrixCard } from '@/components/common/permission-matrix-card'
import { PermissionNotice, UiPermissionBanner } from '@/components/common/permission-notice'
import { StatCard } from '@/components/common/stat-card'
import { TablePagination } from '@/components/common/table-pagination'
import { EmployeeDetailsModal } from '@/components/team/employee-details-modal'
import { EmployeeFormModal } from '@/components/team/employee-form-modal'
import { EmployeeTable } from '@/components/team/employee-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBusinessData } from '@/context/business-context'
import { useRole } from '@/context/role-context'
import { useToast } from '@/context/toast-context'
import { filterEmployees, getEmployeeOverview } from '@/data/employeeSelectors'
import { roleLabels, roles } from '@/data/permissions'
import { formatNumber } from '@/lib/format'

const defaultFilters = { role: 'all', status: 'all', storeId: 'all' }
const pageSize = 10

export default function TeamPage() {
  const { users, stores, addEmployee, updateEmployee, toggleEmployeeStatus } = useBusinessData()
  const { user, can } = useRole()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)

  const allowed = can('manageEmployees')
  const overview = useMemo(() => getEmployeeOverview(users), [users])
  const filteredUsers = useMemo(
    () => filterEmployees({ users, query, ...filters }),
    [users, query, filters],
  )
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const selectedEmployee = modal?.employeeId
    ? users.find((employee) => employee.id === modal.employeeId)
    : null

  const closeModal = () => setModal(null)

  const handleFormSubmit = (values) => {
    if (modal?.type === 'edit' && selectedEmployee) {
      const updated = updateEmployee(selectedEmployee.id, values)
      toast({
        title: 'Employee updated',
        description: `${updated.name} now has the ${roleLabels[updated.role]} role.`,
        variant: 'success',
      })
    } else {
      const created = addEmployee(values)
      toast({
        title: 'Employee added',
        description: `${created.name} can now be selected as a demo user.`,
        variant: 'success',
      })
    }
    closeModal()
  }

  const handleToggle = (employee) => {
    const updated = toggleEmployeeStatus(employee.id)
    toast({
      title: updated.status === 'Active' ? 'Employee activated' : 'Employee deactivated',
      description: `${updated.name}'s account is now ${updated.status.toLowerCase()}.`,
      variant: updated.status === 'Active' ? 'success' : 'warning',
    })
    closeModal()
  }

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team & Access"
        description="Manage employees, store assignments, roles, and UI-only access permissions."
        actions={
          allowed ? (
            <Button onClick={() => setModal({ type: 'add' })}>
              <Plus />
              Add employee
            </Button>
          ) : undefined
        }
      />

      <UiPermissionBanner role={user.role} />

      {!allowed ? (
        <PermissionNotice
          title="Team management is restricted"
          description={`${user.name} cannot manage employees. Only a Super Admin can add users, change roles, or activate accounts in this demo.`}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total employees" value={formatNumber(overview.total)} icon={UserRound} footnote="Mock user records" />
            <StatCard title="Active accounts" value={formatNumber(overview.active)} icon={CircleCheck} tone="success" footnote="Available for role switcher" />
            <StatCard title="Inactive accounts" value={formatNumber(overview.inactive)} icon={UserX} tone="warning" footnote="Access blocked in UI" />
            <StatCard title="Managers & executives" value={formatNumber(overview.managers + overview.executives)} icon={ShieldCheck} footnote="Store-level users" />
          </div>

          <Card className="p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="relative xl:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search employees"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Search name, email, phone or title..."
                  className="pl-9"
                />
              </div>

              <div>
                <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Role
                </Label>
                <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
                  <SelectTrigger aria-label="Employee role filter" className="h-9">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </Label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger aria-label="Employee status filter" className="h-9">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Assigned store
                </Label>
                <Select value={filters.storeId} onValueChange={(value) => updateFilter('storeId', value)}>
                  <SelectTrigger aria-label="Employee store filter" className="h-9">
                    <SelectValue placeholder="All stores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stores</SelectItem>
                    <SelectItem value="all-stores">Super Admin (all)</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>
                <strong className="font-semibold text-foreground">{filteredUsers.length}</strong> employee
                {filteredUsers.length === 1 ? '' : 's'} found
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery('')
                  setFilters(defaultFilters)
                  setPage(1)
                }}
              >
                <RotateCcw />
                Reset
              </Button>
            </div>
          </Card>

          <EmployeeTable
            users={visibleUsers}
            stores={stores}
            onAction={(type, employee) => {
              if (type === 'toggle') handleToggle(employee)
              else setModal({ type, employeeId: employee.id })
            }}
          />
          <TablePagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            noun="employees"
            onPageChange={setPage}
          />

          <PermissionMatrixCard title="Reusable permission configuration" />
        </>
      )}

      {modal?.type === 'add' && (
        <EmployeeFormModal
          open
          onOpenChange={(open) => !open && closeModal()}
          users={users}
          stores={stores}
          onSubmit={handleFormSubmit}
        />
      )}

      {modal?.type === 'edit' && selectedEmployee && (
        <EmployeeFormModal
          open
          onOpenChange={(open) => !open && closeModal()}
          employee={selectedEmployee}
          users={users}
          stores={stores}
          onSubmit={handleFormSubmit}
        />
      )}

      {modal?.type === 'view' && selectedEmployee && (
        <EmployeeDetailsModal
          open
          onOpenChange={(open) => !open && closeModal()}
          employee={selectedEmployee}
          stores={stores}
          onEdit={() => setModal({ type: 'edit', employeeId: selectedEmployee.id })}
          onToggle={() => handleToggle(selectedEmployee)}
        />
      )}
    </div>
  )
}
