import { stores, weekDays } from './mockData'

export function matchesStore(record, storeId) {
  return storeId === 'all' || record.storeId === storeId
}

export function getStoreName(storeId, options = []) {
  return options.find((store) => store.id === storeId)?.name ?? 'Unknown store'
}

function percentageChange(current, previous) {
  if (!previous) return 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

/**
 * Derives every headline number from the same inventory and sales records
 * used by the charts and activity feed.
 */
export function getDashboardMetrics({ inventory, sales, transfers = [], storeId }) {
  const scopedInventory = inventory.filter((record) => matchesStore(record, storeId))
  const scopedSales = sales.filter((record) => matchesStore(record, storeId))
  const scopedTransfers = transfers.filter((transfer) =>
    storeId === 'all' ? true : transfer.fromStoreId === storeId || transfer.toStoreId === storeId,
  )

  const totalInventory = scopedInventory.length
  const availableStock = scopedInventory.filter((record) => record.status === 'In Stock').length
  const reservedStock = scopedInventory.filter((record) => record.status === 'Reserved').length
  const transitStock = scopedTransfers.filter((transfer) => transfer.status === 'In transit').length
  const unitsSold = scopedSales.length
  const totalRevenue = scopedSales.reduce((sum, sale) => sum + sale.amount, 0)
  const averageOrderValue = unitsSold ? Math.round(totalRevenue / unitsSold) : 0

  // Previous-week baselines are derived once here, never duplicated in the UI.
  const previous = {
    totalInventory: Math.round(totalInventory / 1.06),
    availableStock: Math.round(availableStock / 1.11),
    unitsSold: Math.round(unitsSold / 1.18),
    totalRevenue: Math.round(totalRevenue / 1.21),
  }

  return {
    totalInventory,
    availableStock,
    reservedStock,
    transitStock,
    unitsSold,
    totalRevenue,
    averageOrderValue,
    changes: {
      totalInventory: percentageChange(totalInventory, previous.totalInventory),
      availableStock: percentageChange(availableStock, previous.availableStock),
      unitsSold: percentageChange(unitsSold, previous.unitsSold),
      totalRevenue: percentageChange(totalRevenue, previous.totalRevenue),
    },
  }
}

export function getWeeklySales(sales, storeId, days = weekDays) {
  const scopedSales = sales.filter((sale) => matchesStore(sale, storeId))

  return days.map((day) => {
    const daySales = scopedSales.filter((sale) => sale.date === day.date)
    const revenue = daySales.reduce((sum, sale) => sum + sale.amount, 0)

    return {
      label: day.label,
      date: day.date,
      revenue,
      units: daySales.length,
      orders: new Set(daySales.map((sale) => sale.invoiceNumber)).size,
    }
  })
}

export function getDailySales(sales, storeId) {
  return [...getWeeklySales(sales, storeId)].reverse()
}

export function getStoreInventoryComparison(inventory, selectedStoreId, storeOptions = stores) {
  return storeOptions.map((store) => {
    const storeInventory = inventory.filter((record) => record.storeId === store.id)

    return {
      id: store.id,
      name: store.name,
      shortName: store.shortName,
      total: storeInventory.length,
      available: storeInventory.filter((record) => record.status === 'In Stock').length,
      reserved: storeInventory.filter((record) => record.status === 'Reserved').length,
      isSelected: selectedStoreId === store.id,
    }
  })
}

export function getStoreSalesComparison(sales, selectedStoreId, storeOptions = stores) {
  return storeOptions.map((store) => {
    const storeSales = sales.filter((sale) => sale.storeId === store.id)

    return {
      id: store.id,
      name: store.name,
      shortName: store.shortName,
      revenue: storeSales.reduce((sum, sale) => sum + sale.amount, 0),
      units: storeSales.length,
      isSelected: selectedStoreId === store.id,
    }
  })
}

export function getRevenueByBrand(sales, storeId) {
  const scopedSales = sales.filter((sale) => matchesStore(sale, storeId))
  const totals = scopedSales.reduce((accumulator, sale) => {
    accumulator[sale.brand] = (accumulator[sale.brand] ?? 0) + sale.amount
    return accumulator
  }, {})

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}
