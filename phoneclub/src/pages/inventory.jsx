import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Smartphone } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PermissionNotice } from '@/components/common/permission-notice'
import { TablePagination } from '@/components/common/table-pagination'
import { DeviceDetailsModal } from '@/components/inventory/device-details-modal'
import { DeviceFormModal } from '@/components/inventory/device-form-modal'
import { DeviceHistoryModal } from '@/components/inventory/device-history-modal'
import { DeviceSaleModal } from '@/components/inventory/device-sale-modal'
import { DeviceTransferModal } from '@/components/inventory/device-transfer-modal'
import { InventoryFilters } from '@/components/inventory/inventory-filters'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { Button } from '@/components/ui/button'
import { useBusinessData } from '@/context/business-context'
import { useRole } from '@/context/role-context'
import { useStore } from '@/context/store-context'
import { useToast } from '@/context/toast-context'
import {
  filterDevices,
  getDeviceHistory,
  getFilterOptions,
  sortDevices,
} from '@/data/inventorySelectors'
import { matchesStore } from '@/data/selectors'
import { formatNumber } from '@/lib/format'

const defaultFilters = {
  brand: 'all',
  model: 'all',
  storeId: 'all',
  status: 'all',
  condition: 'all',
  fromDate: '',
  toDate: '',
  minPrice: '',
  maxPrice: '',
}

const pageSize = 10

export default function InventoryPage() {
  const { devices: allDevices, stores, historyRecords, updateDevice, recordSale, transferDevice } = useBusinessData()
  const { storeId, store } = useStore()
  const { user, can } = useRole()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()

  const urlQuery = searchParams.get('q') ?? ''
  // Draft is scoped to the current URL term, so a new header search always wins
  // over text typed into the local filter previously.
  const [queryDraft, setQueryDraft] = useState({ key: urlQuery, value: urlQuery })
  const query = queryDraft.key === urlQuery ? queryDraft.value : urlQuery
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState({ key: 'purchaseDate', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)

  const devices = useMemo(
    () => allDevices.filter((device) => matchesStore(device, storeId)),
    [allDevices, storeId],
  )
  const effectiveFilters = useMemo(
    () => ({ ...filters, storeId: storeId === 'all' ? filters.storeId : storeId }),
    [filters, storeId],
  )
  const lockedStoreId = storeId === 'all' ? null : storeId

  const canEdit = can('manageInventory')
  const canSell = can('recordSales')
  const canTransfer = can('transferStock')

  const options = useMemo(() => getFilterOptions(devices), [devices])
  const modelOptions = useMemo(() => {
    if (filters.brand === 'all') return options.models
    return [...new Set(devices.filter((device) => device.brand === filters.brand).map((device) => device.model))].sort()
  }, [devices, filters.brand, options.models])

  const filteredDevices = useMemo(
    () => filterDevices({ devices, query, filters: effectiveFilters, historyRecords }),
    [devices, query, effectiveFilters, historyRecords],
  )
  const sortedDevices = useMemo(() => sortDevices(filteredDevices, sort, stores), [filteredDevices, sort, stores])
  const totalPages = Math.max(1, Math.ceil(sortedDevices.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleDevices = sortedDevices.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const selectedDevice = useMemo(
    () => (modal?.deviceId ? devices.find((device) => device.id === modal.deviceId) : null),
    [devices, modal],
  )
  const selectedHistory = useMemo(
    () => (selectedDevice ? getDeviceHistory(historyRecords, selectedDevice.id) : []),
    [historyRecords, selectedDevice],
  )

  const handleQueryChange = (value) => {
    setQueryDraft({ key: urlQuery, value })
    setPage(1)
  }

  const handleFiltersChange = (next) => {
    if (next.brand !== filters.brand) next.model = 'all'
    setFilters(next)
    setPage(1)
  }

  const handleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )
    setPage(1)
  }

  const closeModal = () => setModal(null)

  const handleFormSubmit = (values) => {
    if (selectedDevice) updateDevice(selectedDevice.id, values)
    closeModal()
  }

  const handleSaleSubmit = (values) => {
    if (selectedDevice) recordSale(selectedDevice.id, values)
    closeModal()
  }

  const handleTransferSubmit = (values) => {
    const transfer = selectedDevice ? transferDevice(selectedDevice.id, values) : null

    if (!transfer) {
      toast({
        title: 'Transfer not completed',
        description: 'Check that the destination is a different store and the device is not sold.',
        variant: 'error',
      })
      return
    }

    toast({
      title: 'Transfer completed',
      description: `${selectedDevice.brand} ${selectedDevice.model} · ${transfer.id}.`,
      variant: 'success',
    })
    closeModal()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mobile Inventory"
        description={`${formatNumber(devices.length)} registered smartphone${devices.length === 1 ? '' : 's'} with individual IMEI tracking${storeId === 'all' ? '.' : ` at ${store.name}.`}`}
        actions={
          canEdit ? (
            <Button asChild>
              <Link to="/add-stock">
                <Plus />
                Add mobile
              </Link>
            </Button>
          ) : undefined
        }
      />

      {!canEdit && (
        <PermissionNotice
          compact
          title="Read-only stock view"
          description={`${user.name} can search and inspect assigned-store stock. Inventory edits and transfers are hidden for this role.`}
        />
      )}

      <InventoryFilters
        query={query}
        onQueryChange={handleQueryChange}
        filters={effectiveFilters}
        onFiltersChange={handleFiltersChange}
        options={{ ...options, models: modelOptions }}
        resultCount={sortedDevices.length}
        onReset={() => {
          setFilters(defaultFilters)
          handleQueryChange('')
        }}
        storeOptions={stores}
        lockedStoreId={lockedStoreId}
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Smartphone className="h-4 w-4" />
          Click a column heading to sort. Use the row menu for device actions.
        </div>
        <InventoryTable
          devices={visibleDevices}
          sort={sort}
          onSort={handleSort}
          onAction={(type, device) => setModal({ type, deviceId: device.id })}
          storeOptions={stores}
          permissions={{ edit: canEdit, sale: canSell, transfer: canTransfer }}
        />
        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={sortedDevices.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      {modal?.type === 'edit' && (
        <DeviceFormModal
          open
          onOpenChange={(open) => !open && closeModal()}
          device={selectedDevice}
          devices={devices}
          onSubmit={handleFormSubmit}
          storeOptions={stores}
          lockedStoreId={lockedStoreId}
        />
      )}

      {modal?.type === 'view' && (
        <DeviceDetailsModal
          open
          onOpenChange={(open) => !open && closeModal()}
          device={selectedDevice}
          historyCount={selectedHistory.length}
          onViewHistory={() => setModal({ type: 'history', deviceId: selectedDevice.id })}
          storeOptions={stores}
        />
      )}

      {modal?.type === 'sale' && (
        <DeviceSaleModal
          open
          onOpenChange={(open) => !open && closeModal()}
          device={selectedDevice}
          onSubmit={handleSaleSubmit}
        />
      )}

      {modal?.type === 'transfer' && (
        <DeviceTransferModal
          open
          onOpenChange={(open) => !open && closeModal()}
          device={selectedDevice}
          onSubmit={handleTransferSubmit}
          storeOptions={stores}
        />
      )}

      {modal?.type === 'history' && (
        <DeviceHistoryModal
          open
          onOpenChange={(open) => !open && closeModal()}
          device={selectedDevice}
          history={selectedHistory}
        />
      )}
    </div>
  )
}
