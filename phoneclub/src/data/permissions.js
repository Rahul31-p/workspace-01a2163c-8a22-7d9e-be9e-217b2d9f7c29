// Reusable UI-only permission configuration. These capabilities drive
// navigation, page gating, action menus, and the permission matrix. They are a
// frontend simulation only — a real backend must authorize every request.

export const roles = ['super_admin', 'store_manager', 'sales_executive']

export const roleLabels = {
  super_admin: 'Super Admin',
  store_manager: 'Store Manager',
  sales_executive: 'Sales Executive',
}

export const roleDescriptions = {
  super_admin: 'Every store, full inventory control, all reports, and employee management.',
  store_manager: 'Assigned store only, manage its inventory, record sales, and view store reports.',
  sales_executive: 'View assigned store stock, search records, and record sales when permitted.',
}

export const roleCapabilities = {
  super_admin: [
    'viewDashboard',
    'viewInventory',
    'viewSales',
    'viewStores',
    'viewTransfers',
    'viewReports',
    'viewTeam',
    'viewAllStores',
    'manageStores',
    'manageInventory',
    'searchStock',
    'recordSales',
    'transferStock',
    'manageEmployees',
  ],
  store_manager: [
    'viewDashboard',
    'viewInventory',
    'viewSales',
    'viewStores',
    'viewTransfers',
    'viewReports',
    'manageInventory',
    'searchStock',
    'recordSales',
    'transferStock',
  ],
  sales_executive: ['viewDashboard', 'viewInventory', 'viewSales', 'searchStock', 'recordSales'],
}

export const mockUsers = [
  {
    id: 'usr-001',
    name: 'Aarav Mehta',
    email: 'aarav@phoneclub.in',
    phone: '9810012345',
    role: 'super_admin',
    storeId: 'all',
    initials: 'AM',
    status: 'Active',
    canRecordSales: true,
    title: 'Founder & Administrator',
    addedAt: '2024-02-01',
  },
  {
    id: 'usr-002',
    name: 'Neha Kapoor',
    email: 'neha@phoneclub.in',
    phone: '9811122233',
    role: 'store_manager',
    storeId: 'cp',
    initials: 'NK',
    status: 'Active',
    canRecordSales: true,
    title: 'Store Manager',
    addedAt: '2024-03-12',
  },
  {
    id: 'usr-003',
    name: 'Vikram Sethi',
    email: 'vikram@phoneclub.in',
    phone: '9822233344',
    role: 'sales_executive',
    storeId: 'saket',
    initials: 'VS',
    status: 'Active',
    canRecordSales: true,
    title: 'Senior Sales Executive',
    addedAt: '2024-07-05',
  },
  {
    id: 'usr-004',
    name: 'Rhea Kapoor',
    email: 'rhea@phoneclub.in',
    phone: '9833344455',
    role: 'sales_executive',
    storeId: 'noida',
    initials: 'RK',
    status: 'Active',
    canRecordSales: false,
    title: 'Sales Executive',
    addedAt: '2024-11-18',
  },
  {
    id: 'usr-005',
    name: 'Amit Verma',
    email: 'amit@phoneclub.in',
    phone: '9844455566',
    role: 'store_manager',
    storeId: 'gurgaon',
    initials: 'AV',
    status: 'Active',
    canRecordSales: true,
    title: 'Store Manager',
    addedAt: '2025-01-09',
  },
  {
    id: 'usr-006',
    name: 'Meera Nair',
    email: 'meera@phoneclub.in',
    phone: '9855566677',
    role: 'sales_executive',
    storeId: 'cp',
    initials: 'MN',
    status: 'Inactive',
    canRecordSales: true,
    title: 'Sales Executive',
    addedAt: '2025-04-02',
  },
]

export const permissionLabels = {
  viewAllStores: 'Access every store',
  manageStores: 'Add, edit and toggle stores',
  manageInventory: 'Manage inventory',
  searchStock: 'View and search stock',
  recordSales: 'Record sales',
  transferStock: 'Transfer stock',
  viewReports: 'View reports',
  manageEmployees: 'Manage employees',
  viewTeam: 'Team & access module',
}

export const permissionMatrix = [
  { capability: 'viewAllStores', super_admin: true, store_manager: false, sales_executive: false },
  { capability: 'manageStores', super_admin: true, store_manager: false, sales_executive: false },
  { capability: 'manageInventory', super_admin: true, store_manager: true, sales_executive: false },
  { capability: 'searchStock', super_admin: true, store_manager: true, sales_executive: true },
  { capability: 'recordSales', super_admin: true, store_manager: true, sales_executive: 'If permitted' },
  { capability: 'transferStock', super_admin: true, store_manager: true, sales_executive: false },
  { capability: 'viewReports', super_admin: true, store_manager: true, sales_executive: false },
  { capability: 'manageEmployees', super_admin: true, store_manager: false, sales_executive: false },
  { capability: 'viewTeam', super_admin: true, store_manager: false, sales_executive: false },
]

export const routeCapabilities = {
  '/dashboard': 'viewDashboard',
  '/inventory': 'viewInventory',
  '/add-stock': 'manageInventory',
  '/sales': 'viewSales',
  '/stores': 'viewStores',
  '/transfers': 'viewTransfers',
  '/reports': 'viewReports',
  '/team': 'viewTeam',
  '/settings': 'viewDashboard',
  '/help': 'viewDashboard',
}

export function canUser(user, capability) {
  if (!user || user.status !== 'Active') return false

  if (capability === 'recordSales' && user.role === 'sales_executive' && !user.canRecordSales) {
    return false
  }

  return roleCapabilities[user.role]?.includes(capability) ?? false
}

export function isRouteAllowed(user, path) {
  const capability = routeCapabilities[path]
  return capability ? canUser(user, capability) : false
}

export function employeeInitials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
