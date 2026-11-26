import { formatCurrency } from '@/lib/format'
import { deviceCatalog } from './mockData'
import { getStoreName } from './selectors'

const modelName = (modelKey) => deviceCatalog[modelKey]?.model ?? 'Device'

/**
 * Builds one unified activity feed from the underlying mock records.
 * No activity row is authored separately from the data it describes.
 */
export function buildActivities({ inventory, sales, transfers, inventoryUpdates, stores }) {
  const storeName = (id) => getStoreName(id, stores)

  const added = inventory.map((device) => ({
    id: `added-${device.id}`,
    type: 'Added',
    category: 'Inventory',
    title: `${modelName(device.modelKey)} added to stock`,
    detail: `${device.variant} · IMEI ${device.imei.slice(-6)}`,
    storeId: device.storeId,
    storeName: storeName(device.storeId),
    user: device.addedBy,
    status: device.status,
    timestamp: device.addedAt,
  }))

  const sold = sales.map((sale) => ({
    id: `sold-${sale.id}`,
    type: 'Sold',
    category: 'Sales',
    title: `${modelName(sale.modelKey)} sold`,
    detail: `${sale.customer} · ${formatCurrency(sale.amount)}`,
    storeId: sale.storeId,
    storeName: storeName(sale.storeId),
    user: sale.handledBy,
    status: sale.status,
    timestamp: sale.soldAt,
  }))

  const moved = transfers.map((transfer) => ({
    id: `transfer-${transfer.id}`,
    type: 'Transfer',
    category: 'Transfer',
    title: `${transfer.units} × ${modelName(transfer.modelKey)} transferred`,
    detail: `${storeName(transfer.fromStoreId)} → ${storeName(transfer.toStoreId)}`,
    storeId: transfer.fromStoreId,
    storeName: storeName(transfer.fromStoreId),
    user: transfer.handledBy,
    status: transfer.status,
    timestamp: transfer.createdAt,
  }))

  const updated = inventoryUpdates.map((update) => ({
    id: `update-${update.id}`,
    type: 'Update',
    category: 'Inventory',
    title: `${modelName(update.modelKey)} inventory updated`,
    detail: update.note,
    storeId: update.storeId,
    storeName: storeName(update.storeId),
    user: update.updatedBy,
    status: update.status,
    timestamp: update.updatedAt,
  }))

  return [...added, ...sold, ...moved, ...updated].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}
