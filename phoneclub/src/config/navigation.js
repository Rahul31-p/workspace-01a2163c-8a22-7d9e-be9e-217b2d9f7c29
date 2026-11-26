import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  LifeBuoy,
  PackagePlus,
  Settings,
  ShoppingCart,
  Smartphone,
  Store,
  UsersRound,
} from 'lucide-react'

export const navigation = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Mobile Inventory', path: '/inventory', icon: Smartphone },
      { label: 'Add New Stock', path: '/add-stock', icon: PackagePlus },
      { label: 'Sales Management', path: '/sales', icon: ShoppingCart },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Store Management', path: '/stores', icon: Store },
      { label: 'Stock Transfers', path: '/transfers', icon: ArrowLeftRight },
      { label: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
      { label: 'Team & Access', path: '/team', icon: UsersRound },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', path: '/settings', icon: Settings },
      { label: 'Help & Support', path: '/help', icon: LifeBuoy },
    ],
  },
]

export const allNavItems = navigation.flatMap((group) => group.items)

export const pageDescriptions = {
  '/inventory': 'Track every handset, IMEI, storage variant, and stock status.',
  '/add-stock': 'Receive new devices into stock and record their IMEI details.',
  '/sales': 'Create invoices, assign devices, and record completed sales.',
  '/stores': 'Manage PHONECLUB locations, their teams, and stock ownership.',
  '/transfers': 'Move devices between stores with a clear transfer history.',
  '/reports': 'Review sales, inventory, revenue, and store performance.',
  '/team': 'Manage staff accounts, roles, and store-level access.',
  '/settings': 'Configure business preferences, pricing rules, and integrations.',
  '/help': 'Find setup guidance, documentation, and support contact details.',
}
