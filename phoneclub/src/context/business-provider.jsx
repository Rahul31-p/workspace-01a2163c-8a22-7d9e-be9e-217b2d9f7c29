import { useMemo, useState } from 'react'
import { mockUsers as seedUsers } from '@/data/permissions'
import {
  MOCK_NOW,
  inventory as seedInventory,
  inventoryUpdates as seedUpdates,
  sales as seedSales,
  stores as seedStores,
  transfers as seedTransfers,
} from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import { toEmployee } from '@/data/employeeSelectors'
import { BusinessContext } from './business-context'

const storeName = (id) => getStoreName(id, seedStores)

const seedHistory = [
  ...seedInventory.map((device) => ({
    id: `added-${device.id}`,
    deviceId: device.id,
    type: 'added',
    title: `Added to ${storeName(device.storeId)}`,
    detail: `IMEI ${device.imei} · ${device.color}`,
    timestamp: device.addedAt,
    user: device.addedBy,
    status: 'Completed',
  })),
  ...seedTransfers.map((transfer) => ({
    id: `transfer-event-${transfer.id}`,
    deviceId: transfer.deviceId,
    type: 'transfer',
    title: `Transfer to ${storeName(transfer.toStoreId)}`,
    detail: `${storeName(transfer.fromStoreId)} → ${storeName(transfer.toStoreId)}`,
    timestamp: transfer.createdAt,
    user: transfer.handledBy,
    status: transfer.status,
  })),
  ...seedUpdates.map((update) => ({
    id: `update-event-${update.id}`,
    deviceId: update.deviceId,
    type: 'update',
    title: 'Inventory record updated',
    detail: update.note,
    timestamp: update.updatedAt,
    user: update.updatedBy,
    status: update.status,
  })),
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

const now = () => new Date().toISOString()
const shortId = () => String(Date.now()).slice(-6)

function nextStoreCode(list) {
  const highest = list.reduce((max, store) => {
    const value = Number(String(store.code ?? '').replace(/\D/g, ''))
    return Number.isFinite(value) ? Math.max(max, value) : max
  }, 0)

  return `ST-${String(highest + 1).padStart(3, '0')}`
}

function storeSlug(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'store'
}

export function BusinessProvider({ children }) {
  const [userRecords, setUserRecords] = useState(seedUsers)
  const [storeRecords, setStoreRecords] = useState(seedStores)
  const [devices, setDevices] = useState(seedInventory)
  const [salesRecords, setSalesRecords] = useState(seedSales)
  const [transferRecords, setTransferRecords] = useState(seedTransfers)
  const updateRecords = seedUpdates
  const [historyRecords, setHistoryRecords] = useState(seedHistory)

  const actions = useMemo(() => {
    const storeName = (id) => getStoreName(id, storeRecords)

    return {
      addEmployee(values) {
        const employee = toEmployee({
          ...values,
          status: values.status ?? 'Active',
        })
        const created = {
          ...employee,
          id: `usr-${String(Date.now()).slice(-6)}-${Math.random().toString(16).slice(2, 5)}`,
          addedAt: now(),
        }

        setUserRecords([...userRecords, created])
        return created
      },

      updateEmployee(id, values) {
        const current = userRecords.find((user) => user.id === id)
        if (!current) return null

        const updated = { ...toEmployee(values, current), id: current.id, addedAt: current.addedAt }
        setUserRecords(userRecords.map((user) => (user.id === id ? updated : user)))
        return updated
      },

      toggleEmployeeStatus(id) {
        const current = userRecords.find((user) => user.id === id)
        if (!current) return null

        const updated = { ...current, status: current.status === 'Active' ? 'Inactive' : 'Active' }
        setUserRecords(userRecords.map((user) => (user.id === id ? updated : user)))
        return updated
      },

      addStore(values) {
        const id = `${storeSlug(values.name)}-${shortId()}`
        const store = {
          ...values,
          id,
          code: nextStoreCode(storeRecords),
          name: String(values.name).trim(),
          address: String(values.address).trim(),
          manager: String(values.manager).trim(),
          contact: String(values.contact).trim(),
          city: values.city || String(values.address).split(',').slice(-2, -1)[0]?.trim() || 'India',
          shortName: String(values.name).trim().slice(0, 2).toUpperCase(),
          status: values.status ?? 'Active',
          openingDate: values.openingDate,
        }

        setStoreRecords([...storeRecords, store])
        return store
      },

      updateStore(id, values) {
        const current = storeRecords.find((store) => store.id === id)
        if (!current) return null

        const updated = {
          ...current,
          ...values,
          name: String(values.name).trim(),
          address: String(values.address).trim(),
          manager: String(values.manager).trim(),
          contact: String(values.contact).trim(),
        }

        setStoreRecords(storeRecords.map((store) => (store.id === id ? updated : store)))
        return updated
      },

      toggleStoreStatus(id) {
        const current = storeRecords.find((store) => store.id === id)
        if (!current) return null

        const updated = { ...current, status: current.status === 'Active' ? 'Inactive' : 'Active' }
        setStoreRecords(storeRecords.map((store) => (store.id === id ? updated : store)))
        return updated
      },

      addDevice(values) {
        const id = `PC-STK-${shortId()}`
        const device = {
          ...values,
          id,
          imei: String(values.imei).trim(),
          variant: `${values.storage} · ${values.color}`,
          price: Number(values.purchasePrice),
          purchasePrice: Number(values.purchasePrice),
          batteryHealth: Number(values.batteryHealth),
          status: values.status ?? 'In Stock',
          source: values.source ?? 'Other',
          supplierName: String(values.supplierName ?? '').trim(),
          boxAvailable: Boolean(values.boxAvailable),
          originalBillAvailable: Boolean(values.originalBillAvailable),
          accessories: String(values.accessories ?? '').trim(),
          warranty: values.warranty ?? 'None',
          notes: String(values.notes ?? '').trim(),
          addedAt: now(),
          addedBy: 'PhoneClub Admin',
        }

        setDevices([...devices, device])
        setHistoryRecords([
          {
            id: `added-${id}`,
            deviceId: id,
            type: 'added',
            title: `Added to ${storeName(device.storeId)}`,
            detail: `IMEI ${device.imei} · ${device.color}`,
            timestamp: device.addedAt,
            user: device.addedBy,
            status: 'Completed',
          },
          ...historyRecords,
        ])

        return device
      },

      updateDevice(id, values) {
        const current = devices.find((device) => device.id === id)
        if (!current) return null

        const updated = {
          ...current,
          ...values,
          imei: String(values.imei).trim(),
          variant: `${values.storage} · ${values.color}`,
          price: Number(values.purchasePrice),
          purchasePrice: Number(values.purchasePrice),
          batteryHealth: Number(values.batteryHealth),
        }

        setDevices(devices.map((device) => (device.id === id ? updated : device)))
        setHistoryRecords([
          {
            id: `update-${shortId()}`,
            deviceId: id,
            type: 'update',
            title: 'Device details updated',
            detail: `${updated.brand} ${updated.model} · ${updated.imei}`,
            timestamp: now(),
            user: 'PhoneClub Admin',
            status: 'Completed',
          },
          ...historyRecords,
        ])

        return updated
      },

      recordSale(id, { customer, customerPhone, salePrice, saleDate, paymentMethod, notes }) {
        const device = devices.find((item) => item.id === id)
        if (!device || device.status === 'Sold') return null

        const sellingPrice = Number(salePrice)
        if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) return null

        const grossProfit = sellingPrice - device.purchasePrice
        const invoiceBase = `INV-${String(Date.now()).slice(-8)}`
        let invoiceNumber = invoiceBase
        let invoiceSuffix = 1
        while (salesRecords.some((item) => item.invoiceNumber === invoiceNumber)) {
          invoiceNumber = `${invoiceBase}-${invoiceSuffix}`
          invoiceSuffix += 1
        }

        const sale = {
          id: `PC-INV-${shortId()}-${Math.random().toString(16).slice(2, 6)}`,
          invoiceNumber,
          date: saleDate,
          soldAt: `${saleDate}T${MOCK_NOW.slice(11)}`,
          storeId: device.storeId,
          modelKey: device.modelKey,
          deviceId: id,
          imei: device.imei,
          customer: customer || '',
          customerPhone: customerPhone || '',
          paymentMethod: paymentMethod || 'Cash',
          notes: notes || '',
          purchasePrice: device.purchasePrice,
          sellingPrice,
          amount: sellingPrice,
          grossProfit,
          profitMargin: sellingPrice ? Math.round((grossProfit / sellingPrice) * 1000) / 10 : 0,
          status: 'Completed',
          handledBy: 'PhoneClub Admin',
          brand: device.brand,
          model: device.model,
          variant: device.variant,
        }

        setDevices(
          devices.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: 'Sold',
                  soldAt: sale.soldAt,
                  salePrice: sellingPrice,
                  invoiceNumber,
                  customer: customer || '',
                }
              : item,
          ),
        )
        setSalesRecords([sale, ...salesRecords])
        setHistoryRecords([
          {
            id: `sale-${sale.id}`,
            deviceId: id,
            type: 'sale',
            title: customer ? `Sold to ${customer}` : 'Sale recorded',
            detail: `${device.brand} ${device.model} · ${sale.invoiceNumber}`,
            timestamp: sale.soldAt,
            user: 'PhoneClub Admin',
            status: 'Completed',
          },
          ...historyRecords,
        ])

        return sale
      },

      transferDevice(id, { toStoreId, note, transferDate, status = 'Completed' }) {
        const device = devices.find((item) => item.id === id)
        if (!device || device.status === 'Sold' || device.storeId === toStoreId) return null
        if (!storeRecords.some((store) => store.id === toStoreId)) return null

        const transferStatus = status === 'In transit' ? 'In transit' : 'Completed'
        const idBase = `PC-TRF-${String(Date.now()).slice(-6)}`
        let transferId = idBase
        let idSuffix = 1
        while (transferRecords.some((item) => item.id === transferId)) {
          transferId = `${idBase}-${idSuffix}`
          idSuffix += 1
        }

        const transfer = {
          id: transferId,
          deviceId: id,
          fromStoreId: device.storeId,
          toStoreId,
          modelKey: device.modelKey,
          brand: device.brand,
          model: device.model,
          variant: device.variant,
          imei: device.imei,
          units: 1,
          status: transferStatus,
          date: transferDate,
          createdAt: `${transferDate}T${MOCK_NOW.slice(11)}`,
          handledBy: 'PhoneClub Admin',
          note: String(note ?? '').trim() || 'Store-to-store transfer',
        }

        // Update the existing record in place. Purchase price, IMEI, condition,
        // and every other original detail stay untouched. No duplicate device.
        setDevices(
          devices.map((item) =>
            item.id === id
              ? {
                  ...item,
                  storeId: toStoreId,
                  status: 'In Stock',
                  lastTransferId: transferId,
                  lastTransferAt: transfer.createdAt,
                }
              : item,
          ),
        )
        setTransferRecords([transfer, ...transferRecords])
        setHistoryRecords([
          {
            id: `transfer-event-${transfer.id}`,
            deviceId: id,
            type: 'transfer',
            title: `Transfer to ${storeName(toStoreId)}`,
            detail: `${storeName(transfer.fromStoreId)} → ${storeName(toStoreId)} · IMEI ${transfer.imei}`,
            timestamp: transfer.createdAt,
            user: 'PhoneClub Admin',
            status: transferStatus,
          },
          ...historyRecords,
        ])

        return transfer
      },
    }
  }, [userRecords, devices, salesRecords, transferRecords, historyRecords, storeRecords])

  const value = useMemo(
    () => ({
      users: userRecords,
      stores: storeRecords,
      devices,
      salesRecords,
      transferRecords,
      updateRecords,
      historyRecords,
      ...actions,
    }),
    [userRecords, storeRecords, devices, salesRecords, transferRecords, updateRecords, historyRecords, actions],
  )

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}
