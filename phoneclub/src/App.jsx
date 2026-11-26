import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { BusinessProvider } from '@/context/business-provider'
import { RoleProvider } from '@/context/role-provider'
import { StoreProvider } from '@/context/store-provider'
import { ToastProvider } from '@/context/toast-provider'
import { allNavItems, pageDescriptions } from '@/config/navigation'
import AddStockPage from '@/pages/add-stock'
import DashboardPage from '@/pages/dashboard'
import InventoryPage from '@/pages/inventory'
import SalesPage from '@/pages/sales'
import StoresPage from '@/pages/stores'
import TransfersPage from '@/pages/transfers'
import ReportsPage from '@/pages/reports'
import TeamPage from '@/pages/team'
import { PlaceholderPage } from '@/pages/placeholder'

const implementedRoutes = new Set([
  '/dashboard',
  '/inventory',
  '/add-stock',
  '/sales',
  '/stores',
  '/transfers',
  '/reports',
  '/team',
])

export default function App() {
  return (
    <BusinessProvider>
      <RoleProvider>
        <StoreProvider>
          <ToastProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/add-stock" element={<AddStockPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/stores" element={<StoresPage />} />
                <Route path="/transfers" element={<TransfersPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/team" element={<TeamPage />} />

                {allNavItems
                  .filter((item) => !implementedRoutes.has(item.path))
                  .map((item) => (
                    <Route
                      key={item.path}
                      path={item.path}
                      element={
                        <PlaceholderPage title={item.label} description={pageDescriptions[item.path]} icon={item.icon} />
                      }
                    />
                  ))}

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </ToastProvider>
        </StoreProvider>
      </RoleProvider>
    </BusinessProvider>
  )
}
