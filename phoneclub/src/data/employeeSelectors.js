import { employeeInitials, roles } from './permissions'

export function validateEmployeeForm(values, users = [], currentId = null) {
  const errors = {}
  const name = String(values.name ?? '').trim()
  const email = String(values.email ?? '').trim().toLowerCase()
  const phone = String(values.phone ?? '').replace(/\D/g, '')

  if (!name) errors.name = 'Full name is required.'
  if (!email) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  } else if (users.some((user) => user.id !== currentId && user.email.toLowerCase() === email)) {
    errors.email = 'Another employee already uses this email.'
  }

  if (phone.length !== 10) errors.phone = 'Phone number must contain 10 digits.'
  if (!roles.includes(values.role)) errors.role = 'Select a valid role.'
  if (!values.storeId) errors.storeId = 'Assign a store.'

  return errors
}

export function filterEmployees({ users, query = '', role = 'all', status = 'all', storeId = 'all' }) {
  const term = query.trim().toLowerCase()
  const targetStoreId = storeId === 'all-stores' ? 'all' : storeId

  return users.filter((user) => {
    const searchable = `${user.name} ${user.email} ${user.phone} ${user.title ?? ''}`.toLowerCase()
    if (term && !searchable.includes(term)) return false
    if (role !== 'all' && user.role !== role) return false
    if (status !== 'all' && user.status !== status) return false
    if (targetStoreId !== 'all' && user.storeId !== targetStoreId) return false
    return true
  })
}

export function getEmployeeOverview(users) {
  return {
    total: users.length,
    active: users.filter((user) => user.status === 'Active').length,
    inactive: users.filter((user) => user.status === 'Inactive').length,
    managers: users.filter((user) => user.role === 'store_manager').length,
    executives: users.filter((user) => user.role === 'sales_executive').length,
  }
}

export function toEmployee(values, existing = null) {
  const name = String(values.name).trim()
  const role = values.role

  return {
    ...existing,
    name,
    email: String(values.email).trim().toLowerCase(),
    phone: String(values.phone).replace(/\D/g, ''),
    role,
    storeId: role === 'super_admin' ? 'all' : values.storeId,
    status: values.status ?? 'Active',
    canRecordSales: role === 'sales_executive' ? Boolean(values.canRecordSales) : true,
    title: String(values.title ?? '').trim() || role.replace('_', ' '),
    initials: employeeInitials(name),
  }
}
