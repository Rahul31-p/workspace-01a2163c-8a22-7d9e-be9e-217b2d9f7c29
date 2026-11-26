import { stores } from './mockData'
import { getStoreName } from './selectors'

export const stockStatuses = ['In Stock', 'Sold', 'Reserved', 'Returned', 'Transferred']

export function getFilterOptions(devices) {
  return {
    brands: [...new Set(devices.map((device) => device.brand))].sort(),
    models: [...new Set(devices.map((device) => device.model))].sort(),
    conditions: [...new Set(devices.map((device) => device.condition))].sort(),
    statuses: stockStatuses,
  }
}

export function filterDevices({ devices, query = '', filters = {}, historyRecords = [] }) {
  const term = query.trim().toLowerCase()

  return devices.filter((device) => {
    const searchable = [device.imei, device.brand, device.model, device.color, device.storage, device.variant]
      .join(' ')
      .toLowerCase()
    if (term && !searchable.includes(term)) return false

    if (filters.brand && filters.brand !== 'all' && device.brand !== filters.brand) return false
    if (filters.model && filters.model !== 'all' && device.model !== filters.model) return false
    if (filters.storeId && filters.storeId !== 'all' && device.storeId !== filters.storeId) return false
    if (filters.condition && filters.condition !== 'all' && device.condition !== filters.condition) return false

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'Transferred') {
        const hasTransfer = historyRecords.some(
          (event) => event.deviceId === device.id && event.type === 'transfer' && event.status === 'Completed',
        )
        if (!hasTransfer || device.status !== 'In Stock') return false
      } else if (device.status !== filters.status) {
        return false
      }
    }

    if (filters.fromDate && device.purchaseDate < filters.fromDate) return false
    if (filters.toDate && device.purchaseDate > filters.toDate) return false

    const minPrice = Number(filters.minPrice)
    if (filters.minPrice && !Number.isNaN(minPrice) && device.purchasePrice < minPrice) return false

    const maxPrice = Number(filters.maxPrice)
    if (filters.maxPrice && !Number.isNaN(maxPrice) && device.purchasePrice > maxPrice) return false

    return true
  })
}

export function sortDevices(devices, sort = { key: 'purchaseDate', direction: 'desc' }, storeOptions = stores) {
  const sortValues = {
    purchaseDate: (device) => device.purchaseDate,
    purchasePrice: (device) => device.purchasePrice,
    brand: (device) => device.brand,
    model: (device) => device.model,
    store: (device) => getStoreName(device.storeId, storeOptions),
  }
  const getValue = sortValues[sort.key] ?? sortValues.purchaseDate
  const multiplier = sort.direction === 'asc' ? 1 : -1

  return [...devices].sort((a, b) => {
    const aValue = getValue(a)
    const bValue = getValue(b)

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier
    }

    return String(aValue).localeCompare(String(bValue)) * multiplier
  })
}

export function getDeviceHistory(historyRecords, deviceId) {
  return historyRecords
    .filter((event) => event.deviceId === deviceId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function hasTransferHistory(historyRecords, deviceId) {
  return historyRecords.some((event) => event.deviceId === deviceId && event.type === 'transfer')
}
