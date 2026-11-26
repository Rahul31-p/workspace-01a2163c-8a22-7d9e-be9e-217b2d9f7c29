import { chromium } from 'playwright'

const base = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true })
const errors = []
const page = await context.newPage()

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

const cell = (rowIndex, cellIndex) => page.locator('tbody tr').nth(rowIndex).locator('td').nth(cellIndex)

async function selectGlobalStore(name) {
  await page.locator('[aria-label="Select store"]:visible').click()
  await page.getByRole('option', { name, exact: true }).click()
  await page.waitForTimeout(180)
}

async function switchUser(name) {
  await page.getByRole('button', { name: 'Switch demo role' }).click()
  await page.getByRole('menuitem', { name: new RegExp(name) }).click()
  await page.waitForTimeout(220)
}

async function metric(label) {
  const text = (await page.locator('main').innerText()).replace(/\u00a0/g, ' ')
  return text.match(new RegExp(`${label}\\s+([^\\n]+)`))?.[1]?.trim() ?? null
}

async function openRowActions() {
  await page.locator('tbody tr').first().locator('[aria-label="Device actions"]').click()
  await page.waitForTimeout(100)
}

await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })

// Capture a non-Saket IMEI for the global-scope check.
await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(180)
let otherImei = ''
let otherStoreName = ''
const inventoryRows = await page.locator('tbody tr').count()
for (let index = 0; index < inventoryRows; index += 1) {
  const title = (await cell(index, 6).locator('[title]').getAttribute('title')) ?? ''
  if (title && !title.includes('Saket')) {
    otherImei = (await cell(index, 4).innerText()).trim()
    otherStoreName = title
    break
  }
}

await page.getByRole('link', { name: 'Store Management', exact: true }).click()
await page.waitForTimeout(220)
await page.screenshot({ path: 'verification/stores-desktop.png', fullPage: true })

console.log('Initial store cards:', await page.locator('[data-store-name]').count())
console.log('Server-authorization disclaimer shown:', (await page.locator('main').innerText()).includes('do not provide server-side authorization'))

const firstCard = page.locator('[data-store-name="Connaught Place"]')
const cardText = await firstCard.innerText()
console.log('Card shows required fields:', [
  'ST-001',
  '17A Connaught Place',
  'Neha Kapoor',
  '9811122233',
  'Active',
].every((part) => cardText.includes(part)))
console.log('Card shows all four overview metrics:', [
  'AVAILABLE MOBILES',
  'MOBILES SOLD',
  'PURCHASE VALUE',
  'SALES REVENUE',
].every((label) => cardText.includes(label)))

// View store details.
await firstCard.getByRole('button', { name: 'View store' }).click()
await page.waitForTimeout(150)
const detailsText = await page.getByRole('dialog').innerText()
const detailParts = [
  'Store ID',
  'ST-001',
  'Address',
  'Manager',
  'Contact Number',
  'Opening Date',
  '2024-03-12',
]
const upperDetails = detailsText.toUpperCase()
console.log(
  'View modal shows details:',
  detailParts.every((part) => upperDetails.includes(part.toUpperCase())),
  detailParts.filter((part) => !upperDetails.includes(part.toUpperCase())),
)
console.log('View modal shows assigned employees:', detailsText.includes('Assigned employees'))
await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click()
await page.waitForTimeout(120)

// Add store validation and creation.
await page.getByRole('button', { name: 'Add store' }).first().click()
await page.waitForTimeout(120)
await page.getByRole('dialog').getByRole('button', { name: 'Add store' }).click()
await page.waitForTimeout(120)
console.log('Required validation shown:', await page.getByText('Store name is required.').isVisible())

await page.getByLabel('Store Name').fill('Rohini West')
await page.getByLabel('Store Address').fill('Plot 9, Sector 16, Rohini, Delhi 110085')
await page.getByLabel('Store Manager').fill('Sanjay Malhotra')
await page.getByLabel('Contact Number').fill('12345')
await page.getByLabel('Opening Date').fill('2026-10-01')
await page.getByRole('dialog').getByRole('button', { name: 'Add store' }).click()
await page.waitForTimeout(120)
console.log('Contact validation shown:', await page.getByText('Contact number must contain 10 digits.').isVisible())

await page.getByLabel('Contact Number').fill('9876543210')
await page.getByRole('dialog').getByRole('button', { name: 'Add store' }).click()
await page.waitForTimeout(220)
console.log('Store created toast:', await page.getByText('Store added', { exact: true }).first().isVisible())
console.log('New store card count:', await page.locator('[data-store-name="Rohini West"]').count())
console.log('Generated Store ID:', (await page.locator('[data-store-name="Rohini West"]').innerText()).includes('ST-005'))
console.log('Store count updated:', (await page.locator('main').innerText()).includes('Manage 5 PHONECLUB locations'))

// New store appears in the global selector.
await page.locator('[aria-label="Select store"]:visible').click()
console.log('Global selector has All Stores:', await page.getByRole('option', { name: 'All Stores', exact: true }).isVisible())
console.log('Global selector has new store:', await page.getByRole('option', { name: 'Rohini West', exact: true }).isVisible())
await page.keyboard.press('Escape')
await page.waitForTimeout(100)

// Edit the created store.
const newCard = page.locator('[data-store-name="Rohini West"]')
await newCard.getByRole('button', { name: 'Edit' }).click()
await page.waitForTimeout(120)
await page.getByLabel('Store Manager').fill('Sanjay Malhotra Jr')
await page.getByRole('dialog').getByRole('button', { name: 'Save changes' }).click()
await page.waitForTimeout(180)
console.log('Edit persisted manager:', (await newCard.innerText()).includes('Sanjay Malhotra Jr'))

// Deactivate / reactivate.
await newCard.getByRole('button', { name: 'Deactivate' }).click()
await page.waitForTimeout(180)
console.log('Deactivated status shown:', (await newCard.innerText()).includes('Inactive'))
await page.locator('[aria-label="Select store"]:visible').click()
console.log('Inactive store labelled in selector:', await page.getByRole('option', { name: 'Rohini West (Inactive)', exact: true }).isVisible())
await page.keyboard.press('Escape')
await newCard.getByRole('button', { name: 'Activate' }).click()
await page.waitForTimeout(180)
console.log('Reactivated status shown:', (await newCard.innerText()).includes('Active'))

// Global store selector consistency across pages.
await selectGlobalStore('Saket')
console.log('Stores page scoped to one card:', await page.locator('[data-store-name]').count())

await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
await page.waitForTimeout(180)
console.log('Dashboard scoped KPIs:', {
  inventory: await metric('Total Inventory'),
  available: await metric('Available Stock'),
  sold: await metric('Units Sold'),
  revenue: await metric('Total Sales Revenue'),
})

await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(180)
const inventoryStoreTitles = await page.locator('tbody tr td:nth-child(7) [title]').evaluateAll((nodes) =>
  nodes.map((node) => node.getAttribute('title')),
)
console.log('Inventory store titles:', inventoryStoreTitles)
console.log('Inventory shows only selected store:', inventoryStoreTitles.length > 0 && inventoryStoreTitles.every((value) => value === 'Saket'))
console.log('Inventory store filter locked:', await page.getByLabel('Filter by store').isDisabled())
console.log('Inventory scope described:', (await page.locator('main').innerText()).includes('at Saket.'))

await page.getByRole('link', { name: 'Sales Management', exact: true }).click()
await page.waitForTimeout(180)
console.log('Sales overview scoped transactions:', await metric('Total transactions'))
const historyStores = await page.locator('tbody tr td:nth-child(4)').allInnerTexts()
console.log('Sales history shows only selected store:', historyStores.length > 0 && historyStores.every((value) => value.trim() === 'Saket'))
console.log('Sales store filter locked:', await page.getByLabel('Sales store filter').isDisabled())
await page.getByLabel('Search IMEI').fill(otherImei)
await page.getByRole('button', { name: 'Find mobile' }).click()
await page.waitForTimeout(150)
console.log('Other-store IMEI not available for sale:', await page.getByText('No mobile found for that IMEI.').isVisible())
console.log('Excluded IMEI belonged to:', otherStoreName || 'another store')

// Role permissions: Sales Executive permitted to record sales.
await switchUser('Vikram Sethi')
console.log('Role selector clamped to assigned store:', (await page.locator('[aria-label="Select store"]:visible').innerText()).includes('Saket'))
console.log('Sales Executive nav hides Add New Stock:', await page.getByRole('link', { name: 'Add New Stock', exact: true }).count() === 0)
console.log('Sales Executive nav hides Store Management:', await page.getByRole('link', { name: 'Store Management', exact: true }).count() === 0)
console.log('Permitted Sales Executive sees sale form:', await page.getByText('Record a sale', { exact: true }).count() === 1)

await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(180)
console.log('Sales Executive has no Add mobile button:', await page.getByRole('link', { name: 'Add mobile' }).count() === 0)
await openRowActions()
console.log('Sales Executive row actions:', {
  edit: await page.getByRole('menuitem', { name: 'Edit details' }).count(),
  sale: await page.getByRole('menuitem', { name: 'Record sale' }).count(),
  transfer: await page.getByRole('menuitem', { name: 'Transfer to another store' }).count(),
})
await page.keyboard.press('Escape')

// Role permissions: Sales Executive without sale permission.
await switchUser('Rhea Kapoor')
await page.getByRole('link', { name: 'Sales Management', exact: true }).click()
await page.waitForTimeout(180)
console.log('Role clamped to Noida:', (await page.locator('main').innerText()).includes('for Noida Sec 18.'))
console.log('Unpermitted sales notice:', await page.getByText('Recording sales is disabled for this demo user').isVisible())
await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(180)
await openRowActions()
console.log('Unperformed role has no Record sale action:', await page.getByRole('menuitem', { name: 'Record sale' }).count() === 0)
await page.keyboard.press('Escape')

// Role permissions: Store Manager.
await switchUser('Neha Kapoor')
console.log('Store Manager has Add New Stock link:', await page.getByRole('link', { name: 'Add New Stock', exact: true }).count() === 1)
await page.getByRole('link', { name: 'Store Management', exact: true }).click()
await page.waitForTimeout(180)
console.log('Store Manager read-only notice:', await page.getByText('Read-only store view').isVisible())
console.log('Store Manager has no Add store button:', await page.getByRole('button', { name: 'Add store' }).count() === 0)

// Restore super admin and verify full access.
await switchUser('Aarav Mehta')
const restoredSelectorText = await page.locator('[aria-label="Select store"]:visible').innerText()
console.log('Super Admin selector text:', restoredSelectorText)
console.log('Super Admin selector restored:', restoredSelectorText.includes('All Stores'))
console.log('Super Admin can add stores:', await page.getByRole('button', { name: 'Add store' }).count() === 1)

// Mobile responsive screenshot.
const mobile = await context.newPage()
mobile.on('pageerror', (error) => errors.push(`mobile: ${error.message}`))
await mobile.setViewportSize({ width: 390, height: 844 })
await mobile.goto(`${base}/stores`, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: 'verification/stores-mobile.png', fullPage: true })
console.log(
  'Mobile page has no horizontal overflow:',
  await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
)

console.log('Console/page errors:', errors.length ? errors : 'none')
await browser.close()
