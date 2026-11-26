import { chromium } from 'playwright'

const base = 'http://localhost:5173'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const errors = []
const page = await context.newPage()

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

const row = (rowIndex = 0) => page.locator('tbody tr').nth(rowIndex)
const cell = (rowIndex, cellIndex) => row(rowIndex).locator('td').nth(cellIndex)

async function chooseSelect(label, option) {
  await page.locator(`[aria-label="${label}"]`).click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await page.waitForTimeout(120)
}

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

function toNumber(value) {
  return Number(String(value ?? '').replace(/[^0-9.-]/g, ''))
}

await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })

// Establish an in-stock device and a different destination store.
await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(200)
await chooseSelect('Filter by stock status', 'In Stock')
const transferImei = (await cell(0, 4).innerText()).trim()
const sourceStore = (await cell(0, 6).locator('[title]').getAttribute('title')) ?? ''
const purchasePriceBefore = (await cell(0, 5).innerText()).trim()
const destinationStore = sourceStore === 'Connaught Place' ? 'Saket' : 'Connaught Place'
console.log('Device to transfer:', { transferImei, sourceStore, destinationStore, purchasePriceBefore })

// Dashboard stock counts before the move.
await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
await page.waitForTimeout(180)
await selectGlobalStore(sourceStore)
const sourceAvailableBefore = toNumber(await metric('Available Stock'))
await selectGlobalStore(destinationStore)
const destinationAvailableBefore = toNumber(await metric('Available Stock'))
await selectGlobalStore('All Stores')
const totalInventoryBefore = toNumber(await metric('Total Inventory'))
console.log('Dashboard before:', { sourceAvailableBefore, destinationAvailableBefore, totalInventoryBefore })

// Open the dedicated transfer module through the sidebar link.
await page.getByRole('link', { name: 'Stock Transfers', exact: true }).click()
await page.waitForTimeout(220)
await page.screenshot({ path: 'verification/transfers-desktop.png', fullPage: true })

console.log('Overview seeded:', {
  transfers: await metric('Total transfers'),
  completed: await metric('Completed'),
  inTransit: await metric('In transit'),
  uniqueDevices: await metric('Unique devices'),
})

const requiredColumns = [
  'Transfer ID',
  'Mobile Brand & Model',
  'IMEI Number',
  'Source Store',
  'Destination Store',
  'Transfer Date',
  'Status',
]
console.log(
  'History columns present:',
  requiredColumns.every((column) => page.locator('thead').getByText(column, { exact: true }).isVisible()),
)

// Search by IMEI in the seeded history.
await page.getByLabel('Search transfers').fill('356789000001730')
await page.waitForTimeout(150)
console.log('History IMEI search rows:', await page.locator('tbody tr').count())
await page.getByLabel('Search transfers').fill('')

// Status and store filters.
await chooseSelect('Transfer status filter', 'In transit')
console.log('In transit filter rows:', await page.locator('tbody tr').count())
console.log('In transit filter status:', (await cell(0, 6).innerText()).trim())
await chooseSelect('Transfer status filter', 'All statuses')
await chooseSelect('Transfer store filter', 'Saket')
console.log('Store filter shows only involved stores:', await page.locator('tbody tr').count() > 0)
await chooseSelect('Transfer store filter', 'All stores')

// Search and select a mobile by IMEI.
await page.getByLabel('Search transfer IMEI').fill(transferImei)
await page.getByRole('button', { name: 'Find mobile' }).click()
await page.waitForTimeout(150)
await page.getByRole('button', { name: new RegExp(transferImei) }).first().click()
await page.waitForTimeout(150)

const detailsText = (await page.locator('main').innerText()).toUpperCase()
console.log('Selected mobile details shown:', [
  'BRAND',
  'MODEL',
  'STORAGE',
  'COLOR',
  'IMEI NUMBER',
  'PURCHASE PRICE',
  'CURRENT STORE',
  'STOCK STATUS',
].every((label) => detailsText.includes(label)))
console.log('Current store verified:', detailsText.includes(sourceStore.toUpperCase()))
console.log('Source input read-only:', await page.getByLabel('Source Store').isEditable() === false)

// Same-source destination must not be offered.
await page.locator('[aria-label="Destination Store"]').click()
const destinationOptions = (await page.getByRole('option').allInnerTexts()).map((option) => option.trim())
console.log('Same store excluded from destinations:', !destinationOptions.includes(sourceStore))
await page.getByRole('option', { name: destinationStore, exact: true }).click()
await page.waitForTimeout(120)

await chooseSelect('Transfer Status', 'Completed')
await page.getByLabel('Transfer Note').fill('Phase 7 browser verification')
await page.waitForTimeout(100)
await page.getByRole('button', { name: 'Confirm transfer' }).click()
await page.waitForTimeout(300)

console.log('Transfer success toast:', await page.getByText('Transfer completed', { exact: true }).first().isVisible())
console.log('History shortcut in toast:', await page.getByRole('link', { name: 'View history' }).isVisible())
const toastDescription = await page.getByText(/moved to/).first().innerText()
const transferId = toastDescription.match(/PC-TRF-\d+(?:-\d+)?/)?.[0]
console.log('Generated transfer ID:', transferId)

// History row contains all required fields.
await page.getByLabel('Search transfers').fill(transferId)
await page.waitForTimeout(180)
console.log('New transfer result rows:', await page.locator('tbody tr').count())
const rowText = await row(0).innerText()
console.log('New transfer row complete:', [
  transferId,
  transferImei,
  sourceStore,
  destinationStore,
  '2026-11-25',
  'Completed',
].every((part) => rowText.includes(part)))
await page.getByLabel('Search transfers').fill('')

// Inventory integrity: one record, moved store, unchanged purchase price.
await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(200)
await page.getByLabel('Search inventory').fill(transferImei)
await page.waitForTimeout(180)
console.log('Inventory rows after transfer:', await page.locator('tbody tr').count())
console.log('Store after transfer:', (await cell(0, 6).locator('[title]').getAttribute('title')) ?? '')
console.log('Status after transfer:', (await cell(0, 10).innerText()).trim())
console.log('Purchase price preserved:', (await cell(0, 5).innerText()).trim() === purchasePriceBefore)

// Store counts update on the dashboard.
await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
await page.waitForTimeout(180)
await selectGlobalStore(sourceStore)
const sourceAvailableAfter = toNumber(await metric('Available Stock'))
await selectGlobalStore(destinationStore)
const destinationAvailableAfter = toNumber(await metric('Available Stock'))
await selectGlobalStore('All Stores')
const totalInventoryAfter = toNumber(await metric('Total Inventory'))
console.log('Dashboard after:', { sourceAvailableAfter, destinationAvailableAfter, totalInventoryAfter })
console.log('Source stock decreased:', sourceAvailableAfter === sourceAvailableBefore - 1)
console.log('Destination stock increased:', destinationAvailableAfter === destinationAvailableBefore + 1)
console.log('No duplicate device record:', totalInventoryAfter === totalInventoryBefore)

// Sold devices cannot be transferred.
await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(180)
await chooseSelect('Filter by stock status', 'Sold')
const soldImei = (await cell(0, 4).innerText()).trim()
await page.getByRole('link', { name: 'Stock Transfers', exact: true }).click()
await page.waitForTimeout(180)
await page.getByLabel('Search transfer IMEI').fill(soldImei)
await page.getByRole('button', { name: 'Find mobile' }).click()
await page.waitForTimeout(120)
await page.getByRole('button', { name: new RegExp(soldImei) }).first().click()
await page.waitForTimeout(120)
console.log('Sold transfer warning:', await page.getByText(/already sold and cannot be transferred/).isVisible())
console.log('Confirm transfer disabled for sold device:', await page.getByRole('button', { name: 'Confirm transfer' }).isDisabled())

// Deep link from the inventory row action.
await page.getByRole('link', { name: 'Mobile Inventory', exact: true }).click()
await page.waitForTimeout(180)
await chooseSelect('Filter by stock status', 'In Stock')
const deepLinkImei = (await cell(0, 4).innerText()).trim()
await page.locator('tbody tr').first().locator('[aria-label="Device actions"]').click()
await page.getByRole('menuitem', { name: 'Transfer to another store' }).click()
await page.waitForTimeout(120)
await page.getByRole('link', { name: 'Use detailed transfer form' }).click()
await page.waitForTimeout(200)
console.log('Deep link reached transfer form:', page.url().includes(`/transfers?imei=${deepLinkImei}`))
console.log('Deep link preselected IMEI:', (await page.getByLabel('Search transfer IMEI').inputValue()) === deepLinkImei)

// Global store scoping on the transfer page.
await selectGlobalStore('Noida Sec 18')
const sources = await page.locator('tbody tr td:nth-child(4)').allInnerTexts()
const destinations = await page.locator('tbody tr td:nth-child(5)').allInnerTexts()
console.log(
  'Transfer history scoped to global store:',
  sources.length > 0 && sources.every((value, index) => value.trim() === 'Noida Sec 18' || destinations[index].trim() === 'Noida Sec 18'),
)
console.log('Transfer store filter locked:', await page.getByLabel('Transfer store filter').isDisabled())
await selectGlobalStore('All Stores')

// Role gating for transfers.
await switchUser('Vikram Sethi')
console.log('Sales Executive transfer form hidden:', await page.getByText('Transfer stock', { exact: true }).count() === 0)
console.log('Sales Executive transfer notice:', await page.getByText('Transfers are disabled for this role').isVisible())
await switchUser('Neha Kapoor')
console.log('Store Manager transfer form visible:', await page.getByText('Transfer stock', { exact: true }).count() === 1)

// Responsive screenshot.
const mobile = await context.newPage()
mobile.on('pageerror', (error) => errors.push(`mobile: ${error.message}`))
await mobile.setViewportSize({ width: 390, height: 844 })
await mobile.goto(`${base}/transfers`, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: 'verification/transfers-mobile.png', fullPage: true })
console.log(
  'Mobile page has no horizontal overflow:',
  await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
)

console.log('Console/page errors:', errors.length ? errors : 'none')
await browser.close()
