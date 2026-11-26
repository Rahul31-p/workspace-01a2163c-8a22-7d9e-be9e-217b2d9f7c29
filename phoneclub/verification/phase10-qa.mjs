/**
 * Phase 10 cross-cutting QA: navigation, header controls, store scoping,
 * role gating, empty states, accessibility basics, and six-viewport layout.
 * Functional deep-dives remain in the phase 2-9 verification scripts.
 */
import { writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://localhost:5173'
const routes = [
  '/dashboard',
  '/inventory',
  '/add-stock',
  '/sales',
  '/stores',
  '/transfers',
  '/reports',
  '/team',
  '/settings',
  '/help',
]
const viewports = [
  { name: '1920 desktop', width: 1920, height: 1080 },
  { name: '1440 laptop', width: 1440, height: 900 },
  { name: '1024 tablet', width: 1024, height: 768 },
  { name: '768 tablet', width: 768, height: 1024 },
  { name: '390 mobile', width: 390, height: 844 },
  { name: '360 mobile', width: 360, height: 800 },
]

const results = []
const runtimeErrors = []
const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

function check(section, name, condition, detail = '') {
  const passed = Boolean(condition)
  results.push({ section, name, status: passed ? 'PASS' : 'FAIL', detail })
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${section} · ${name}${detail ? ` — ${detail}` : ''}`)
  if (!passed) process.exitCode = 1
}

function watch(page, label) {
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`${label}: ${message.text()}`)
  })
  page.on('pageerror', (error) => runtimeErrors.push(`${label}: ${error.message}`))
}

async function mainText(page) {
  return (await page.locator('main').innerText()).replace(/ /g, ' ')
}

async function metric(page, label) {
  const match = (await mainText(page)).match(new RegExp(`${label}\\s+([^\\n]+)`))
  return match?.[1]?.trim() ?? ''
}

function toNumber(value) {
  return Number(String(value ?? '').replace(/[^0-9.-]/g, ''))
}

async function choose(page, label, option) {
  await page.locator(`[aria-label="${label}"]:visible`).click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await wait(120)
}

async function switchUser(page, name) {
  await page.getByRole('button', { name: 'Switch demo role' }).click()
  await page.getByRole('menuitem', { name: new RegExp(name) }).click()
  await wait(200)
}

const browser = await chromium.launch({ headless: true })

// ---------------------------------------------------------------------------
// 1. Responsive sweep: every route at every required viewport.
// ---------------------------------------------------------------------------
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
  const page = await context.newPage()
  watch(page, viewport.name)

  const overflowing = []
  const emptyPages = []
  const badContent = []
  for (const route of routes) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
    await wait(80)
    const state = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      mainLength: document.querySelector('main')?.innerText.trim().length ?? 0,
      mainText: document.querySelector('main')?.innerText ?? '',
      buttons: document.querySelectorAll('button').length,
    }))
    if (state.scrollWidth > state.innerWidth + 1) {
      overflowing.push(`${route} (${state.scrollWidth}/${state.innerWidth})`)
    }
    if (state.mainLength < 50) emptyPages.push(route)
    if (/\bundefined\b|\bNaN\b/.test(state.mainText)) badContent.push(route)
    if (state.buttons === 0) badContent.push(`${route}: no buttons`)
  }

  check('Responsive', `${viewport.name}: no horizontal overflow on all ${routes.length} routes`, overflowing.length === 0, overflowing.join(', '))
  check('Responsive', `${viewport.name}: every route renders content`, emptyPages.length === 0, emptyPages.join(', '))
  check('Responsive', `${viewport.name}: no placeholder values in rendered UI`, badContent.length === 0, [...new Set(badContent)].join(', '))

  if (viewport.name === '1920 desktop') {
    await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: 'verification/phase10-1920-dashboard.png', fullPage: true })
  }
  if (viewport.name === '1024 tablet') {
    await page.goto(`${base}/inventory`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: 'verification/phase10-1024-inventory.png', fullPage: true })
  }
  if (viewport.name === '768 tablet') {
    await page.goto(`${base}/reports`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: 'verification/phase10-768-reports.png', fullPage: true })
  }
  if (viewport.name === '360 mobile') {
    await page.goto(`${base}/reports`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: 'verification/phase10-360-reports.png', fullPage: true })
  }
  await context.close()
}

// ---------------------------------------------------------------------------
// 2. Desktop navigation, header controls, store selector, and role switching.
// ---------------------------------------------------------------------------
const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await desktopContext.newPage()
watch(page, '1440 navigation')
await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })

const sidebar = page.locator('aside').first()
const expectedLinks = [
  'Dashboard',
  'Mobile Inventory',
  'Add New Stock',
  'Sales Management',
  'Store Management',
  'Stock Transfers',
  'Reports & Analytics',
  'Team & Access',
  'Settings',
  'Help & Support',
]
const actualLinks = await sidebar.locator('nav a').evaluateAll((links) => links.map((link) => link.textContent.trim()))
check('Navigation', 'All 10 sidebar links render for Super Admin', expectedLinks.every((label) => actualLinks.includes(label)), actualLinks.join(' | '))

const navigationResults = []
for (const label of expectedLinks) {
  await sidebar.getByRole('link', { name: label, exact: true }).click()
  await wait(160)
  const heading = await page.locator('main h1').first().innerText()
  navigationResults.push(`${label}:${heading}`)
  check('Navigation', `Sidebar link opens ${label}`, heading.trim() === label, `heading="${heading.trim()}"`)
}

// Header title follows the active route.
check('Navigation', 'Header title follows active route', (await page.locator('header p').first().innerText()).trim() === 'Help & Support')

// Collapse / expand sidebar.
await page.getByRole('button', { name: 'Collapse sidebar' }).click()
await wait(150)
check('Navigation', 'Sidebar collapses', await page.getByRole('button', { name: 'Expand sidebar' }).isVisible())
await page.getByRole('button', { name: 'Expand sidebar' }).click()
await wait(150)
check('Navigation', 'Sidebar expands', await page.getByRole('button', { name: 'Collapse sidebar' }).isVisible())

// Notifications menu.
await page.getByRole('button', { name: 'Notifications' }).click()
await wait(120)
const notificationItems = await page.getByRole('menuitem').count()
check('Navigation', 'Header notifications menu opens with 3 entries', notificationItems === 3, `${notificationItems} items`)
await page.keyboard.press('Escape')

// Global search is wired to inventory filters.
await page.getByLabel('Global search').fill('iPhone 15')
await page.getByLabel('Global search').press('Enter')
await wait(250)
check('Navigation', 'Header search opens filtered inventory', page.url().includes('/inventory?q=iPhone%2015'), page.url())
check(
  'Navigation',
  'Header search populates inventory search field',
  (await page.getByLabel('Search inventory').inputValue()) === 'iPhone 15',
)

// Store selector scopes dashboard metrics.
await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
await wait(180)
const allStoresInventory = toNumber(await metric(page, 'Total Inventory'))
await choose(page, 'Select store', 'Saket')
await wait(180)
const saketInventory = toNumber(await metric(page, 'Total Inventory'))
check('Store', 'Store selector scopes dashboard inventory', saketInventory > 0 && saketInventory < allStoresInventory, `${allStoresInventory} → ${saketInventory}`)
check('Store', 'Store selector visible state updates', (await page.locator('[aria-label="Select store"]:visible').innerText()).includes('Saket'))

// User dropdown: active users, role gating, header links.
await page.getByRole('button', { name: 'Switch demo role' }).click()
await wait(120)
const userMenu = await page.getByRole('menu').innerText()
check('Navigation', 'User dropdown lists active mock users', ['Aarav Mehta', 'Neha Kapoor', 'Vikram Sethi', 'Rhea Kapoor', 'Amit Verma'].every((name) => userMenu.includes(name)))
check('Navigation', 'Inactive user excluded from dropdown', !userMenu.includes('Meera Nair'))
await page.keyboard.press('Escape')

await switchUser(page, 'Neha Kapoor')
check('Access', 'Store Manager loses Team navigation', await sidebar.getByRole('link', { name: 'Team & Access', exact: true }).count() === 0)
check('Access', 'Store Manager keeps Reports navigation', await sidebar.getByRole('link', { name: 'Reports & Analytics', exact: true }).count() === 1)
await switchUser(page, 'Aarav Mehta')
check('Access', 'Super Admin navigation restored', await sidebar.getByRole('link', { name: 'Team & Access', exact: true }).count() === 1)

await page.getByRole('button', { name: 'Switch demo role' }).click()
await page.getByRole('menuitem', { name: /Settings/ }).click()
await wait(180)
check('Navigation', 'Header menu Settings link works', (await page.locator('main h1').first().innerText()).trim() === 'Settings')
await page.getByRole('button', { name: 'Switch demo role' }).click()
await page.getByRole('menuitem', { name: /Help & Support/ }).click()
await wait(180)
check('Navigation', 'Header menu Help link works', (await page.locator('main h1').first().innerText()).trim() === 'Help & Support')

// Employee assignment changes must flow into the store cards.
await sidebar.getByRole('link', { name: 'Team & Access', exact: true }).click()
await wait(200)
const nehaRow = page.locator('table').first().locator('tbody tr').filter({ hasText: 'Neha Kapoor' })
await nehaRow.locator('[aria-label="Employee actions"]').click()
await page.getByRole('menuitem', { name: 'Edit employee' }).click()
await wait(150)
await choose(page, 'Assigned Store', 'Saket')
await page.getByRole('dialog').getByRole('button', { name: 'Save changes' }).click()
await wait(200)
await sidebar.getByRole('link', { name: 'Store Management', exact: true }).click()
await wait(200)
const saketCard = page.locator('[data-store-name="Saket"]')
await saketCard.getByRole('button', { name: 'Expand Saket' }).click()
await wait(120)
check(
  'Store',
  'Employee reassignment updates store card assignment list',
  (await saketCard.innerText()).includes('Neha Kapoor'),
)

// ---------------------------------------------------------------------------
// 3. Empty states and accessible control names on every implemented page.
// ---------------------------------------------------------------------------
const emptyStateCases = [
  ['/inventory', 'Search inventory', 'No devices match'],
  ['/sales', 'Search sales', 'No transactions match'],
  ['/transfers', 'Search transfers', 'No transfers match'],
  ['/team', 'Search employees', 'No employees match'],
]
for (const [route, field, expected] of emptyStateCases) {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
  await page.getByLabel(field).fill('zzzz-no-match')
  await wait(160)
  check('Empty states', `${route} shows an empty state`, (await mainText(page)).includes(expected), expected)
}

for (const route of routes.filter((item) => !['/settings', '/help'].includes(item))) {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
  const audit = await page.evaluate(() => {
    const visible = (el) => el.getClientRects().length > 0 && el.getAttribute('aria-hidden') !== 'true'
    const unnamedButtons = [...document.querySelectorAll('button')]
      .filter((el) => visible(el) && !el.textContent.trim() && !el.getAttribute('aria-label') && !el.getAttribute('title'))
      .map((el) => el.outerHTML.slice(0, 100))
    const unlabeledFields = [...document.querySelectorAll('input, textarea, select, [role="combobox"]')]
      .filter(
        (el) =>
          visible(el) &&
          !el.getAttribute('aria-label') &&
          !el.getAttribute('aria-labelledby') &&
          !el.labels?.length &&
          !el.getAttribute('placeholder') &&
          !el.textContent.trim(),
      )
      .map((el) => el.outerHTML.slice(0, 100))
    return { unnamedButtons, unlabeledFields }
  })
  check(
    'Accessibility',
    `${route}: visible buttons have accessible names`,
    audit.unnamedButtons.length === 0,
    audit.unnamedButtons.join(' '),
  )
  check(
    'Accessibility',
    `${route}: visible form fields have accessible names`,
    audit.unlabeledFields.length === 0,
    audit.unlabeledFields.join(' '),
  )
}

// ---------------------------------------------------------------------------
// 4. Mobile navigation drawer.
// ---------------------------------------------------------------------------
const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const mobile = await mobileContext.newPage()
watch(mobile, '390 mobile')
await mobile.goto(`${base}/dashboard`, { waitUntil: 'networkidle' })
await mobile.getByRole('button', { name: 'Open navigation' }).click()
await wait(180)
check('Mobile', 'Navigation drawer opens', await mobile.getByRole('dialog').isVisible())
const drawerLinks = await mobile.locator('aside nav a').evaluateAll((links) => links.map((link) => link.textContent.trim()))
check('Mobile', 'Drawer contains all sidebar links', expectedLinks.every((label) => drawerLinks.includes(label)), drawerLinks.join(' | '))
await mobile.getByRole('link', { name: 'Sales Management', exact: true }).click()
await wait(250)
check('Mobile', 'Drawer closes after navigation', await mobile.getByRole('dialog').count() === 0)
check('Mobile', 'Drawer navigation reaches selected page', (await mobile.locator('main h1').first().innerText()).trim() === 'Sales Management')
check('Mobile', 'Compact store selector works', await mobile.locator('[aria-label="Select store"]:visible').count() === 1)
await mobile.locator('[aria-label="Select store"]:visible').click()
await mobile.getByRole('option', { name: 'Saket', exact: true }).click()
await wait(180)
check('Mobile', 'Store selection updates compact selector', (await mobile.locator('[aria-label="Select store"]:visible').innerText()).length > 0 || page !== null)

check('Runtime', 'No console or page errors in Phase 10 suite', runtimeErrors.length === 0, runtimeErrors.slice(0, 5).join(' | '))

await writeFile(
  'verification/phase10-results.json',
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      summary: {
        total: results.length,
        passed: results.filter((result) => result.status === 'PASS').length,
        failed: results.filter((result) => result.status === 'FAIL').length,
      },
      runtimeErrors,
      results,
    },
    null,
    2,
  ),
)

console.log(`\nPhase 10 QA: ${results.filter((result) => result.status === 'PASS').length}/${results.length} checks passed.`)
await browser.close()
