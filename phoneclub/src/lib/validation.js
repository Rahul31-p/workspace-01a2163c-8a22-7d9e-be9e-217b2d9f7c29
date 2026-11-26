/**
 * IMEI rules used by both add and edit forms.
 * A transferred device keeps the same record and IMEI, so uniqueness is
 * checked against every device except the one being edited.
 */
export function validateImei(value, devices = [], excludeId) {
  const imei = String(value ?? '').trim()

  if (!imei) return 'IMEI number is required.'
  if (!/^\d{15}$/.test(imei)) return 'IMEI must contain exactly 15 digits.'

  const duplicate = devices.some((device) => device.imei === imei && device.id !== excludeId)
  if (duplicate) return 'This IMEI already belongs to another device.'

  return null
}

export function validateDeviceForm(values, devices = [], excludeId) {
  const errors = {}

  if (!values.brand) errors.brand = 'Select a brand.'
  if (!String(values.model ?? '').trim()) errors.model = 'Model is required.'
  if (!String(values.storage ?? '').trim()) errors.storage = 'Storage is required.'
  if (!String(values.color ?? '').trim()) errors.color = 'Color is required.'

  const imeiError = validateImei(values.imei, devices, excludeId)
  if (imeiError) errors.imei = imeiError

  const price = Number(values.purchasePrice)
  if (!values.purchasePrice || Number.isNaN(price) || price <= 0) errors.purchasePrice = 'Enter a valid price.'

  if (!values.storeId) errors.storeId = 'Select a store.'
  if (!values.purchaseDate) errors.purchaseDate = 'Purchase date is required.'
  if (!values.condition) errors.condition = 'Select a condition.'

  const battery = Number(values.batteryHealth)
  if (Number.isNaN(battery) || battery < 0 || battery > 100) errors.batteryHealth = 'Use a value from 0 to 100.'

  return errors
}

export function validateAddStockForm(values, devices = []) {
  const errors = validateDeviceForm(values, devices)

  if (!values.grade) errors.grade = 'Select a grade.'
  if (!values.source) errors.source = 'Select the source of the mobile.'

  // Supplier name is only required when the device came from a supplier.
  if (values.source === 'Supplier' && !String(values.supplierName ?? '').trim()) {
    errors.supplierName = 'Supplier name is required for supplier purchases.'
  }

  if (!values.batteryHealth && values.batteryHealth !== 0) {
    errors.batteryHealth = 'Battery health is required.'
  }

  return errors
}
