import { saleAmount } from './salesSelectors'

export function getStoreOverview({ store, devices = [], sales = [], users = [] }) {
  if (!store) {
    return {
      available: 0,
      sold: 0,
      purchaseValue: 0,
      revenue: 0,
      employees: [],
      totalDevices: 0,
    }
  }

  const scopedDevices = devices.filter((device) => device.storeId === store.id)
  const scopedSales = sales.filter((sale) => sale.storeId === store.id)

  return {
    available: scopedDevices.filter((device) => device.status === 'In Stock').length,
    sold: scopedSales.length,
    purchaseValue: scopedDevices.reduce((sum, device) => sum + Number(device.purchasePrice ?? 0), 0),
    revenue: scopedSales.reduce((sum, sale) => sum + saleAmount(sale), 0),
    employees: users.filter((user) => user.storeId === store.id || user.storeId === 'all'),
    totalDevices: scopedDevices.length,
  }
}

export function validateStoreForm(values, stores = [], currentId = null) {
  const errors = {}
  const name = String(values.name ?? '').trim()
  const contact = String(values.contact ?? '').replace(/\D/g, '')

  if (!name) errors.name = 'Store name is required.'
  else if (
    stores.some(
      (store) =>
        store.id !== currentId && store.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    errors.name = 'A store with this name already exists.'
  }

  if (!String(values.address ?? '').trim()) errors.address = 'Store address is required.'
  if (!String(values.manager ?? '').trim()) errors.manager = 'Store manager is required.'
  if (contact.length !== 10) errors.contact = 'Contact number must contain 10 digits.'
  if (!values.openingDate) errors.openingDate = 'Opening date is required.'

  return errors
}
