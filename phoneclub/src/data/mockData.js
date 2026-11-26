// Single source of truth for Phase 2 dashboard data.
// Every metric, chart, and activity row is derived from these records.

export const MOCK_NOW = '2026-11-25T18:00:00'

export const stores = [
  {
    id: 'cp',
    code: 'ST-001',
    name: 'Connaught Place',
    shortName: 'CP',
    city: 'New Delhi',
    address: '17A Connaught Place, New Delhi, Delhi 110001',
    manager: 'Neha Kapoor',
    contact: '9811122233',
    status: 'Active',
    openingDate: '2024-03-12',
  },
  {
    id: 'saket',
    code: 'ST-002',
    name: 'Saket',
    shortName: 'SK',
    city: 'New Delhi',
    address: 'Saket Courtyard Mall, Saket, New Delhi, Delhi 110017',
    manager: 'Vikram Sethi',
    contact: '9822233344',
    status: 'Active',
    openingDate: '2024-07-05',
  },
  {
    id: 'noida',
    code: 'ST-003',
    name: 'Noida Sec 18',
    shortName: 'NO',
    city: 'Noida',
    address: 'Shop 22, Sector 18 Market, Noida, Uttar Pradesh 201301',
    manager: 'Rhea Kapoor',
    contact: '9833344455',
    status: 'Active',
    openingDate: '2024-11-18',
  },
  {
    id: 'gurgaon',
    code: 'ST-004',
    name: 'Gurugram',
    shortName: 'GG',
    city: 'Haryana',
    address: 'Cyber Hub DLF Phase 2, Gurugram, Haryana 122002',
    manager: 'Amit Verma',
    contact: '9844455566',
    status: 'Active',
    openingDate: '2025-01-09',
  },
]

export const allStoreOption = { id: 'all', name: 'All Stores', shortName: 'All', city: 'PHONECLUB network' }

export const weekDays = [
  { date: '2026-11-19', label: 'Thu' },
  { date: '2026-11-20', label: 'Fri' },
  { date: '2026-11-21', label: 'Sat' },
  { date: '2026-11-22', label: 'Sun' },
  { date: '2026-11-23', label: 'Mon' },
  { date: '2026-11-24', label: 'Tue' },
  { date: '2026-11-25', label: 'Wed' },
]

export const deviceCatalog = {
  iphone15pro: {
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    variant: '256GB · Natural Titanium',
    price: 134900,
  },
  iphone15: {
    brand: 'Apple',
    model: 'iPhone 15',
    variant: '128GB · Blue',
    price: 79900,
  },
  s24ultra: {
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    variant: '512GB · Titanium Gray',
    price: 149999,
  },
  s24: {
    brand: 'Samsung',
    model: 'Galaxy S24',
    variant: '256GB · Onyx Black',
    price: 89999,
  },
  pixel8pro: {
    brand: 'Google',
    model: 'Pixel 8 Pro',
    variant: '256GB · Obsidian',
    price: 76999,
  },
  oneplus12: {
    brand: 'OnePlus',
    model: 'OnePlus 12',
    variant: '256GB · Flowy Emerald',
    price: 69999,
  },
  xiaomi14: {
    brand: 'Xiaomi',
    model: 'Xiaomi 14',
    variant: '256GB · Jade Green',
    price: 59999,
  },
  vivo100: {
    brand: 'Vivo',
    model: 'Vivo X100',
    variant: '256GB · Startrail Blue',
    price: 63999,
  },
  reno11: {
    brand: 'Oppo',
    model: 'Reno 11 Pro',
    variant: '256GB · Wave Green',
    price: 44999,
  },
  nothing2a: {
    brand: 'Nothing',
    model: 'Phone (2a)',
    variant: '256GB · Black',
    price: 24999,
  },
}

export const brandColors = {
  Apple: '#c2410c',
  Samsung: '#1f7a3a',
  Google: '#b26a00',
  OnePlus: '#f7782a',
  Xiaomi: '#0b4a8b',
  Vivo: '#8e1414',
  Oppo: '#f26a1b',
  Nothing: '#6e6e73',
}

const storeAgents = {
  cp: 'Aditi Rao',
  saket: 'Vikram Sethi',
  noida: 'Neha Kapoor',
  gurgaon: 'Rahul Mehta',
}

// [model key, store id, status, added timestamp]
const inventorySeed = [
  ['iphone15pro', 'cp', 'Available', '2026-11-25T09:40:00'],
  ['iphone15', 'cp', 'Available', '2026-11-24T16:20:00'],
  ['s24ultra', 'cp', 'Available', '2026-11-24T11:05:00'],
  ['s24', 'cp', 'Reserved', '2026-11-23T14:30:00'],
  ['pixel8pro', 'cp', 'Available', '2026-11-23T10:15:00'],
  ['oneplus12', 'cp', 'Available', '2026-11-22T18:40:00'],
  ['xiaomi14', 'cp', 'Available', '2026-11-22T12:10:00'],
  ['vivo100', 'cp', 'Reserved', '2026-11-21T15:25:00'],
  ['reno11', 'cp', 'Available', '2026-11-21T09:50:00'],
  ['nothing2a', 'cp', 'Available', '2026-11-20T17:05:00'],
  ['iphone15pro', 'saket', 'In transit', '2026-11-20T11:30:00'],
  ['s24', 'cp', 'Available', '2026-11-19T13:45:00'],

  ['s24ultra', 'saket', 'Available', '2026-11-25T08:55:00'],
  ['iphone15', 'saket', 'Available', '2026-11-24T14:10:00'],
  ['pixel8pro', 'saket', 'Available', '2026-11-24T09:35:00'],
  ['oneplus12', 'saket', 'Reserved', '2026-11-23T16:50:00'],
  ['iphone15pro', 'saket', 'Available', '2026-11-23T12:20:00'],
  ['s24', 'saket', 'Available', '2026-11-22T15:40:00'],
  ['xiaomi14', 'saket', 'Available', '2026-11-22T10:05:00'],
  ['reno11', 'saket', 'Available', '2026-11-21T13:15:00'],
  ['nothing2a', 'cp', 'In transit', '2026-11-21T08:30:00'],
  ['vivo100', 'saket', 'Available', '2026-11-20T12:55:00'],
  ['iphone15', 'saket', 'Available', '2026-11-19T16:25:00'],

  ['s24', 'noida', 'Available', '2026-11-25T10:20:00'],
  ['iphone15pro', 'noida', 'Reserved', '2026-11-24T13:05:00'],
  ['oneplus12', 'noida', 'Available', '2026-11-24T08:45:00'],
  ['pixel8pro', 'noida', 'Available', '2026-11-23T15:10:00'],
  ['xiaomi14', 'noida', 'Available', '2026-11-23T09:20:00'],
  ['s24ultra', 'gurgaon', 'In transit', '2026-11-22T17:30:00'],
  ['reno11', 'noida', 'Available', '2026-11-22T11:55:00'],
  ['vivo100', 'noida', 'Available', '2026-11-21T14:40:00'],
  ['nothing2a', 'noida', 'Available', '2026-11-20T10:30:00'],

  ['iphone15', 'gurgaon', 'Available', '2026-11-25T11:15:00'],
  ['s24ultra', 'gurgaon', 'Available', '2026-11-24T15:50:00'],
  ['pixel8pro', 'gurgaon', 'Reserved', '2026-11-24T10:25:00'],
  ['oneplus12', 'gurgaon', 'Available', '2026-11-23T13:35:00'],
  ['xiaomi14', 'gurgaon', 'Available', '2026-11-23T08:50:00'],
  ['vivo100', 'gurgaon', 'Available', '2026-11-22T16:10:00'],
  ['reno11', 'noida', 'In transit', '2026-11-21T12:00:00'],
  ['nothing2a', 'gurgaon', 'Available', '2026-11-20T09:15:00'],

  // Closed and returned records are kept so every stock status is represented.
  ['iphone15', 'cp', 'Sold', '2026-11-18T12:10:00'],
  ['s24', 'saket', 'Sold', '2026-11-18T15:30:00'],
  ['pixel8pro', 'noida', 'Returned', '2026-11-19T11:45:00'],
  ['oneplus12', 'gurgaon', 'Sold', '2026-11-20T13:20:00'],
  ['xiaomi14', 'cp', 'Returned', '2026-11-21T10:05:00'],
  ['vivo100', 'saket', 'Sold', '2026-11-22T17:00:00'],
  ['reno11', 'noida', 'Sold', '2026-11-23T09:40:00'],
  ['nothing2a', 'gurgaon', 'Sold', '2026-11-24T14:25:00'],
]

const statuses = {
  Available: 'In Stock',
  'In transit': 'In Stock',
  Reserved: 'Reserved',
  Sold: 'Sold',
  Returned: 'Returned',
}

const conditions = ['New', 'Excellent', 'Good', 'New', 'Excellent', 'Fair']

export const inventory = inventorySeed.map(([modelKey, storeId, status, addedAt], index) => {
  const catalogItem = deviceCatalog[modelKey]
  const [storage, color] = catalogItem.variant.split(' · ')

  return {
    id: `PC-STK-${String(4101 + index)}`,
    imei: `356${String(789000000000 + index * 173).slice(-12)}`,
    modelKey,
    storeId,
    status: statuses[status] ?? 'In Stock',
    addedAt,
    addedBy: storeAgents[storeId],
    storage,
    color,
    purchasePrice: Math.round(catalogItem.price * (0.74 + (index % 5) * 0.015)),
    purchaseDate: addedAt.slice(0, 10),
    condition: conditions[index % conditions.length],
    batteryHealth: 100 - (index % 9),
    ...catalogItem,
  }
})

// [date, store id, model key, customer]
const salesSeed = [
  ['2026-11-19', 'cp', 'iphone15pro', 'Rohit Sharma'],
  ['2026-11-19', 'cp', 'oneplus12', 'Meera Nair'],
  ['2026-11-19', 'saket', 's24ultra', 'Karan Malhotra'],
  ['2026-11-19', 'noida', 'pixel8pro', 'Sneha Iyer'],
  ['2026-11-19', 'gurgaon', 'iphone15', 'Arjun Bedi'],

  ['2026-11-20', 'cp', 's24', 'Pooja Arora'],
  ['2026-11-20', 'cp', 'nothing2a', 'Ravi Teja'],
  ['2026-11-20', 'saket', 'iphone15', 'Nisha Gupta'],
  ['2026-11-20', 'saket', 'xiaomi14', 'Deepak Joshi'],
  ['2026-11-20', 'noida', 'reno11', 'Ananya Verma'],
  ['2026-11-20', 'gurgaon', 's24ultra', 'Vikram Chauhan'],

  ['2026-11-21', 'cp', 'iphone15pro', 'Aman Khan'],
  ['2026-11-21', 'cp', 'vivo100', 'Shruti Parekh'],
  ['2026-11-21', 'cp', 'pixel8pro', 'Gaurav Jain'],
  ['2026-11-21', 'saket', 's24', 'Ishita Bansal'],
  ['2026-11-21', 'saket', 'oneplus12', 'Manish Yadav'],
  ['2026-11-21', 'noida', 'iphone15', 'Tanya Singh'],
  ['2026-11-21', 'noida', 'nothing2a', 'Harsh Vardhan'],
  ['2026-11-21', 'gurgaon', 'reno11', 'Neelam Sharma'],

  ['2026-11-22', 'cp', 's24ultra', 'Rishi Kapoor'],
  ['2026-11-22', 'cp', 'reno11', 'Sonal Aggarwal'],
  ['2026-11-22', 'saket', 'iphone15pro', 'Devansh Roy'],
  ['2026-11-22', 'saket', 'vivo100', 'Priya Nair'],
  ['2026-11-22', 'noida', 's24', 'Abhishek Kumar'],
  ['2026-11-22', 'noida', 'xiaomi14', 'Ritika Jain'],
  ['2026-11-22', 'gurgaon', 'iphone15', 'Sahil Munjal'],
  ['2026-11-22', 'gurgaon', 'oneplus12', 'Divya Sharma'],

  ['2026-11-23', 'cp', 'iphone15', 'Varun Bhatia'],
  ['2026-11-23', 'cp', 'xiaomi14', 'Anjali Menon'],
  ['2026-11-23', 'saket', 'pixel8pro', 'Rohan Gupta'],
  ['2026-11-23', 'noida', 'iphone15pro', 'Sanya Khanna'],
  ['2026-11-23', 'gurgaon', 's24', 'Kabir Sethi'],

  ['2026-11-24', 'cp', 's24ultra', 'Aditi Malhotra'],
  ['2026-11-24', 'cp', 'nothing2a', 'Nikhil Verma'],
  ['2026-11-24', 'cp', 'vivo100', 'Bhavya Shah'],
  ['2026-11-24', 'saket', 'iphone15', 'Mohit Bansal'],
  ['2026-11-24', 'saket', 'oneplus12', 'Priyanka Sen'],
  ['2026-11-24', 'noida', 'reno11', 'Yashasvi Rao'],
  ['2026-11-24', 'gurgaon', 'pixel8pro', 'Simran Kaur'],

  ['2026-11-25', 'cp', 'iphone15pro', 'Rohit Sharma'],
  ['2026-11-25', 'cp', 's24', 'Kavya Nair'],
  ['2026-11-25', 'saket', 's24ultra', 'Ananya Verma'],
  ['2026-11-25', 'saket', 'xiaomi14', 'Vivek Dutta'],
  ['2026-11-25', 'noida', 'iphone15', 'Ishaan Roy'],
  ['2026-11-25', 'gurgaon', 'oneplus12', 'Rhea Kapoor'],
]

const paymentMethods = ['Cash', 'UPI', 'Card', 'Bank Transfer']

export const sales = salesSeed.map(([date, storeId, modelKey, customer], index) => {
  const hour = 10 + (index % 9)
  const minute = (index * 17) % 60
  const sellingPrice = deviceCatalog[modelKey].price
  const purchasePrice = Math.round(sellingPrice * (0.74 + (index % 5) * 0.015))

  return {
    id: `PC-INV-${String(7101 + index)}`,
    invoiceNumber: `INV-${String(2048 + index)}`,
    date,
    soldAt: `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
    storeId,
    modelKey,
    customer,
    customerPhone: '',
    imei: `355${String(421000000000 + index * 149).slice(-12)}`,
    paymentMethod: paymentMethods[index % paymentMethods.length],
    notes: '',
    purchasePrice,
    sellingPrice,
    amount: sellingPrice,
    grossProfit: sellingPrice - purchasePrice,
    profitMargin: Math.round(((sellingPrice - purchasePrice) / sellingPrice) * 1000) / 10,
    status: 'Completed',
    handledBy: storeAgents[storeId],
    ...deviceCatalog[modelKey],
  }
})

// Each transfer references the exact device record it moved. A completed
// transfer updates that record's storeId; it never creates a duplicate row.
const transferSeed = [
  {
    id: 'PC-TRF-0634',
    deviceId: 'PC-STK-4111',
    fromStoreId: 'cp',
    toStoreId: 'saket',
    modelKey: 'iphone15pro',
    units: 1,
    status: 'Completed',
    createdAt: '2026-11-25T09:05:00',
    handledBy: 'Amit Verma',
    note: 'Rebalanced flagship stock',
  },
  {
    id: 'PC-TRF-0633',
    deviceId: 'PC-STK-4129',
    fromStoreId: 'noida',
    toStoreId: 'gurgaon',
    modelKey: 's24ultra',
    units: 1,
    status: 'Completed',
    createdAt: '2026-11-24T16:30:00',
    handledBy: 'Neha Kapoor',
    note: 'Customer request',
  },
  {
    id: 'PC-TRF-0632',
    deviceId: 'PC-STK-4121',
    fromStoreId: 'saket',
    toStoreId: 'cp',
    modelKey: 'nothing2a',
    units: 1,
    status: 'Completed',
    createdAt: '2026-11-23T11:45:00',
    handledBy: 'Vikram Sethi',
    note: 'Store replenishment',
  },
  {
    id: 'PC-TRF-0631',
    deviceId: 'PC-STK-4139',
    fromStoreId: 'gurgaon',
    toStoreId: 'noida',
    modelKey: 'reno11',
    units: 1,
    status: 'Completed',
    createdAt: '2026-11-22T14:20:00',
    handledBy: 'Rahul Mehta',
    note: 'Store replenishment',
  },
  {
    id: 'PC-TRF-0630',
    deviceId: 'PC-STK-4137',
    fromStoreId: 'gurgaon',
    toStoreId: 'noida',
    modelKey: 'vivo100',
    units: 1,
    status: 'In transit',
    createdAt: '2026-11-21T10:10:00',
    handledBy: 'Amit Verma',
    note: 'Awaiting receiving confirmation',
  },
]

// Transfer records always reference one physical inventory record. Brand,
// model, and IMEI are derived from that record so the history table never
// duplicates or reinvents device identity.
export const transfers = transferSeed.map((transfer) => {
  const device = inventory.find((item) => item.id === transfer.deviceId)
  const catalogItem = deviceCatalog[transfer.modelKey]

  return {
    ...transfer,
    date: transfer.createdAt.slice(0, 10),
    brand: catalogItem.brand,
    model: catalogItem.model,
    variant: catalogItem.variant,
    imei: device?.imei ?? '',
  }
})

export const inventoryUpdates = [
  {
    id: 'PC-UPD-1188',
    deviceId: 'PC-STK-4101',
    storeId: 'cp',
    modelKey: 'iphone15pro',
    note: 'IMEI verified and warranty checked',
    status: 'Completed',
    updatedAt: '2026-11-25T11:20:00',
    updatedBy: 'Aditi Rao',
  },
  {
    id: 'PC-UPD-1187',
    deviceId: 'PC-STK-4114',
    storeId: 'saket',
    modelKey: 's24ultra',
    note: 'Price updated after supplier revision',
    status: 'Completed',
    updatedAt: '2026-11-24T17:40:00',
    updatedBy: 'Vikram Sethi',
  },
  {
    id: 'PC-UPD-1186',
    deviceId: 'PC-STK-4128',
    storeId: 'noida',
    modelKey: 's24',
    note: 'Condition grade changed to Excellent',
    status: 'Completed',
    updatedAt: '2026-11-24T12:15:00',
    updatedBy: 'Neha Kapoor',
  },
  {
    id: 'PC-UPD-1185',
    deviceId: 'PC-STK-4139',
    storeId: 'noida',
    modelKey: 'reno11',
    note: 'Reserved for customer pickup',
    status: 'In progress',
    updatedAt: '2026-11-23T15:05:00',
    updatedBy: 'Rahul Mehta',
  },
  {
    id: 'PC-UPD-1184',
    deviceId: 'PC-STK-4108',
    storeId: 'cp',
    modelKey: 'vivo100',
    note: 'Stock count reconciled with physical audit',
    status: 'Completed',
    updatedAt: '2026-11-22T09:35:00',
    updatedBy: 'Aditi Rao',
  },
]

export const teamMembers = Object.entries(storeAgents).map(([storeId, name]) => ({
  id: storeId,
  name,
  role: 'Store Manager',
  storeId,
}))
