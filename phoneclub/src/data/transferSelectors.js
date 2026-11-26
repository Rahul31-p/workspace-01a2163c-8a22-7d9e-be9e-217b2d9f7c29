import { stores as seedStores } from './mockData'
import { getStoreName } from './selectors'

export const transferStatuses = ['Completed', 'In transit']

export function getTransferOverview(transfers, storeId) {
  const scoped = transfers.filter((transfer) =>
    storeId === 'all'
      ? true
      : transfer.fromStoreId === storeId || transfer.toStoreId === storeId,
  )

  return {
    totalTransfers: scoped.length,
    completed: scoped.filter((transfer) => transfer.status === 'Completed').length,
    inTransit: scoped.filter((transfer) => transfer.status === 'In transit').length,
    uniqueDevices: new Set(scoped.map((transfer) => transfer.deviceId)).size,
  }
}

export function filterTransfers({ transfers, query = '', filters = {}, storeOptions = seedStores }) {
  const term = query.trim().toLowerCase()

  return transfers
    .filter((transfer) => {
      const searchable = [
        transfer.id,
        transfer.brand,
        transfer.model,
        transfer.imei,
        getStoreName(transfer.fromStoreId, storeOptions),
        getStoreName(transfer.toStoreId, storeOptions),
        transfer.note,
        transfer.handledBy,
      ]
        .join(' ')
        .toLowerCase()

      if (term && !searchable.includes(term)) return false

      if (filters.storeId && filters.storeId !== 'all') {
        const involvesStore =
          transfer.fromStoreId === filters.storeId || transfer.toStoreId === filters.storeId
        if (!involvesStore) return false
      }

      if (filters.status && filters.status !== 'all' && transfer.status !== filters.status) return false

      const date = transfer.date ?? String(transfer.createdAt ?? '').slice(0, 10)
      if (filters.fromDate && date < filters.fromDate) return false
      if (filters.toDate && date > filters.toDate) return false

      if (filters.direction && filters.direction !== 'all') {
        if (filters.direction === 'inbound' && transfer.toStoreId !== filters.storeId) return false
        if (filters.direction === 'outbound' && transfer.fromStoreId !== filters.storeId) return false
      }

      return true
    })
    .sort((a, b) => new Date(b.createdAt ?? b.date).getTime() - new Date(a.createdAt ?? a.date).getTime())
}

export function getTransferValidation(device, toStoreId, storeOptions = seedStores) {
  if (!device) return 'Search and select a mobile first.'
  if (device.status === 'Sold') return 'Sold devices cannot be transferred.'
  if (!toStoreId) return 'Select a destination store.'
  if (device.storeId === toStoreId) return 'Source and destination stores cannot be identical.'
  if (!storeOptions.some((store) => store.id === toStoreId)) return 'Select a valid destination store.'
  return ''
}

export function transferScoped(transfers, storeId) {
  return transfers.filter(
    (transfer) => storeId === 'all' || transfer.fromStoreId === storeId || transfer.toStoreId === storeId,
  )
}
