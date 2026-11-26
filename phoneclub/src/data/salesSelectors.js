import { stores } from './mockData'
import { getStoreName, matchesStore } from './selectors'

export function saleAmount(sale) {
  return Number(sale.sellingPrice ?? sale.amount ?? 0)
}

export function salePurchasePrice(sale) {
  return Number(sale.purchasePrice ?? Math.round(saleAmount(sale) * 0.78))
}

export function saleGrossProfit(sale) {
  if (typeof sale.grossProfit === 'number') return sale.grossProfit
  return saleAmount(sale) - salePurchasePrice(sale)
}

export function saleProfitMargin(sale) {
  if (typeof sale.profitMargin === 'number') return sale.profitMargin
  const amount = saleAmount(sale)
  return amount ? Math.round((saleGrossProfit(sale) / amount) * 1000) / 10 : 0
}

export function getSalesOverview(sales, storeId) {
  const scoped = sales.filter((sale) => matchesStore(sale, storeId))
  const totalRevenue = scoped.reduce((sum, sale) => sum + saleAmount(sale), 0)
  const totalGrossProfit = scoped.reduce((sum, sale) => sum + saleGrossProfit(sale), 0)

  return {
    totalTransactions: scoped.length,
    totalRevenue,
    totalGrossProfit,
    averageSellingPrice: scoped.length ? Math.round(totalRevenue / scoped.length) : 0,
    mobilesSold: scoped.length,
  }
}

export function filterSales({ sales, query = '', filters = {}, storeOptions = stores }) {
  const term = query.trim().toLowerCase()

  return sales
    .filter((sale) => {
      const searchable = [
        sale.invoiceNumber,
        sale.model,
        sale.imei,
        getStoreName(sale.storeId, storeOptions),
        sale.customer,
        sale.paymentMethod,
      ]
        .join(' ')
        .toLowerCase()

      if (term && !searchable.includes(term)) return false
      if (filters.storeId && filters.storeId !== 'all' && sale.storeId !== filters.storeId) return false
      if (filters.paymentMethod && filters.paymentMethod !== 'all' && sale.paymentMethod !== filters.paymentMethod) {
        return false
      }
      if (filters.fromDate && sale.date < filters.fromDate) return false
      if (filters.toDate && sale.date > filters.toDate) return false

      if (filters.profit === 'profitable' && saleGrossProfit(sale) <= 0) return false
      if (filters.profit === 'loss' && saleGrossProfit(sale) >= 0) return false

      return true
    })
    .sort((a, b) => new Date(b.soldAt ?? b.date).getTime() - new Date(a.soldAt ?? a.date).getTime())
}
