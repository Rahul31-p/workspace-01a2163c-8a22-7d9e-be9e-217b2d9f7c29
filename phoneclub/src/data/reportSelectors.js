import { APP_TODAY } from './formOptions'
import { stores as seedStores } from './mockData'
import { getStoreName } from './selectors'
import { saleAmount, saleGrossProfit } from './salesSelectors'

export const reportPresets = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'custom', label: 'Custom range' },
]

function toDate(value) {
  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1))
}

function toISO(date) {
  return date.toISOString().slice(0, 10)
}

function shiftDays(value, days) {
  const date = toDate(value)
  date.setUTCDate(date.getUTCDate() + days)
  return toISO(date)
}

function daysBetween(from, to) {
  return Math.max(0, Math.round((toDate(to) - toDate(from)) / 86400000)) + 1
}

export function getReportDateRange(preset = 'this_week', custom = {}) {
  const today = APP_TODAY

  if (preset === 'today') return { from: today, to: today, label: 'Today' }

  if (preset === 'this_week') {
    return { from: shiftDays(today, -6), to: today, label: 'This week (last 7 days)' }
  }

  if (preset === 'this_month') {
    return { from: `${today.slice(0, 7)}-01`, to: today, label: 'This month' }
  }

  if (preset === 'last_month') {
    const current = toDate(today)
    const lastMonthEnd = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 0))
    const lastMonthStart = new Date(Date.UTC(lastMonthEnd.getUTCFullYear(), lastMonthEnd.getUTCMonth(), 1))
    return { from: toISO(lastMonthStart), to: toISO(lastMonthEnd), label: 'Last month' }
  }

  const from = custom.from || today
  const to = custom.to || today
  return {
    from: from <= to ? from : to,
    to: from <= to ? to : from,
    label: 'Custom range',
  }
}

export function inDateRange(date, range) {
  if (!date) return false
  return date >= range.from && date <= range.to
}

export function filterSalesForReport(sales, { range, storeId }) {
  return sales.filter(
    (sale) =>
      (storeId === 'all' || sale.storeId === storeId) && inDateRange(sale.date ?? String(sale.soldAt).slice(0, 10), range),
  )
}

export function filterInventoryForReport(devices, { range, storeId }) {
  return devices.filter(
    (device) => (storeId === 'all' || device.storeId === storeId) && inDateRange(device.purchaseDate, range),
  )
}

export function getSalesReportMetrics(sales) {
  const revenue = sales.reduce((sum, sale) => sum + saleAmount(sale), 0)
  const profit = sales.reduce((sum, sale) => sum + saleGrossProfit(sale), 0)

  return {
    totalRevenue: revenue,
    totalProfit: profit,
    averageSellingPrice: sales.length ? Math.round(revenue / sales.length) : 0,
    transactions: sales.length,
    margin: revenue ? Math.round((profit / revenue) * 1000) / 10 : 0,
  }
}

export function getInventoryReportMetrics(devices) {
  return {
    totalPurchased: devices.length,
    available: devices.filter((device) => device.status === 'In Stock').length,
    sold: devices.filter((device) => device.status === 'Sold').length,
    reserved: devices.filter((device) => device.status === 'Reserved').length,
    purchaseValue: devices.reduce((sum, device) => sum + Number(device.purchasePrice ?? 0), 0),
  }
}

function shortDate(date) {
  return toDate(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'UTC' })
}

function monthlyLabel(key) {
  const [year, month] = key.split('-')
  return `${toDate(`${year}-${month}-01`).toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' })} ${year}`
}

export function getDailySalesSeries(sales, range) {
  const buckets = new Map()
  const span = Math.min(daysBetween(range.from, range.to), 62)

  for (let index = 0; index < span; index += 1) {
    const date = shiftDays(range.from, index)
    buckets.set(date, { date, label: shortDate(date), revenue: 0, units: 0, profit: 0 })
  }

  sales.forEach((sale) => {
    const date = sale.date ?? String(sale.soldAt).slice(0, 10)
    const bucket = buckets.get(date)
    if (!bucket) return
    bucket.revenue += saleAmount(sale)
    bucket.profit += saleGrossProfit(sale)
    bucket.units += 1
  })

  return [...buckets.values()]
}

export function getWeeklySalesSeries(sales, range) {
  const daily = getDailySalesSeries(sales, range)
  if (daily.length <= 10) return daily

  const buckets = new Map()
  daily.forEach((row) => {
    const date = toDate(row.date)
    const weekday = (date.getUTCDay() + 6) % 7
    date.setUTCDate(date.getUTCDate() - weekday)
    const key = toISO(date)
    const bucket = buckets.get(key) ?? { key, label: `${shortDate(key)} week`, revenue: 0, units: 0, profit: 0 }
    bucket.revenue += row.revenue
    bucket.profit += row.profit
    bucket.units += row.units
    buckets.set(key, bucket)
  })

  return [...buckets.values()]
}

export function getMonthlySalesSeries(sales, range) {
  const buckets = new Map()
  let cursor = `${range.from.slice(0, 7)}-01`
  const lastMonth = range.to.slice(0, 7)

  while (cursor.slice(0, 7) <= lastMonth && buckets.size < 24) {
    const month = cursor.slice(0, 7)
    buckets.set(month, { month, label: monthlyLabel(month), revenue: 0, units: 0, profit: 0 })
    const date = toDate(cursor)
    date.setUTCMonth(date.getUTCMonth() + 1)
    cursor = toISO(date)
  }

  sales.forEach((sale) => {
    const month = String(sale.date ?? '').slice(0, 7)
    const bucket = buckets.get(month)
    if (!bucket) return
    bucket.revenue += saleAmount(sale)
    bucket.profit += saleGrossProfit(sale)
    bucket.units += 1
  })

  return [...buckets.values()]
}

export function getRevenueAreaSeries(sales, range) {
  let running = 0

  return getDailySalesSeries(sales, range).map((row) => {
    running += row.revenue
    return { label: row.label, revenue: row.revenue, cumulative: running }
  })
}

export function getBrandStock(devices) {
  const buckets = new Map()

  devices.forEach((device) => {
    const bucket = buckets.get(device.brand) ?? { name: device.brand, units: 0, value: 0 }
    bucket.units += 1
    bucket.value += Number(device.purchasePrice ?? 0)
    buckets.set(device.brand, bucket)
  })

  return [...buckets.values()].sort((a, b) => b.units - a.units)
}

export function getModelStock(devices) {
  const buckets = new Map()

  devices.forEach((device) => {
    const key = `${device.brand} ${device.model}`
    const bucket = buckets.get(key) ?? { name: key, brand: device.brand, units: 0, value: 0 }
    bucket.units += 1
    bucket.value += Number(device.purchasePrice ?? 0)
    buckets.set(key, bucket)
  })

  return [...buckets.values()].sort((a, b) => b.units - a.units)
}

export function getStoreComparison({ devices, sales, storeOptions = seedStores }) {
  return storeOptions.map((store) => {
    const scopedDevices = devices.filter((device) => device.storeId === store.id)
    const scopedSales = sales.filter((sale) => sale.storeId === store.id)
    const revenue = scopedSales.reduce((sum, sale) => sum + saleAmount(sale), 0)

    return {
      id: store.id,
      name: store.name,
      shortName: store.shortName,
      revenue,
      units: scopedSales.length,
      grossProfit: scopedSales.reduce((sum, sale) => sum + saleGrossProfit(sale), 0),
      inventoryValue: scopedDevices.reduce((sum, device) => sum + Number(device.purchasePrice ?? 0), 0),
      available: scopedDevices.filter((device) => device.status === 'In Stock').length,
      devices: scopedDevices.length,
    }
  })
}

export function getReportRecordSummary({ sales, inventory, storeOptions = seedStores }) {
  return {
    sales: sales.map((sale) => ({
      'Invoice Number': sale.invoiceNumber,
      'Sale Date': sale.date,
      Store: getStoreName(sale.storeId, storeOptions),
      Brand: sale.brand,
      Model: sale.model,
      IMEI: sale.imei,
      Customer: sale.customer || '',
      'Payment Method': sale.paymentMethod,
      'Selling Price': saleAmount(sale),
      'Purchase Price': Number(sale.purchasePrice ?? 0),
      'Gross Profit': saleGrossProfit(sale),
      'Profit Margin (%)': Number(sale.profitMargin ?? 0),
    })),
    inventory: inventory.map((device) => ({
      'Device ID': device.id,
      'Purchase Date': device.purchaseDate,
      Store: getStoreName(device.storeId, storeOptions),
      Brand: device.brand,
      Model: device.model,
      Storage: device.storage,
      Color: device.color,
      IMEI: device.imei,
      Status: device.status,
      'Purchase Price': Number(device.purchasePrice ?? 0),
    })),
  }
}
