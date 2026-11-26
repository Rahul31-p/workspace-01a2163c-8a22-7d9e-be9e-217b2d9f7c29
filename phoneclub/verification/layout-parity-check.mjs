/**
 * No-layout-change verification: compares the pre-theme reference app
 * (localhost:5174) with themed app (localhost:5173) using browser geometry,
 * DOM structure, text, and non-color computed styles.
 */
import { writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const beforeBase = process.env.BEFORE_URL ?? 'http://localhost:5174'
const afterBase = process.env.AFTER_URL ?? 'http://localhost:5173'
const routes = [
  '/dashboard', '/inventory', '/add-stock', '/sales', '/stores',
  '/transfers', '/reports', '/team', '/settings', '/help',
]
const viewports = [
  { name: '1920', width: 1920, height: 1080 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
  { name: '360', width: 360, height: 800 },
]

const results = []
const errors = []
const check = (name, ok, detail = '') => {
  results.push({ name, status: ok ? 'PASS' : 'FAIL', detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) process.exitCode = 1
}

const snapshot = () => {
  const nonColorProps = [
    'display', 'position', 'visibility', 'boxSizing', 'width', 'height',
    'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'gap', 'rowGap', 'columnGap',
    'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign', 'whiteSpace',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
    'flexDirection', 'flexWrap', 'flexGrow', 'flexShrink', 'flexBasis',
    'alignItems', 'alignSelf', 'justifyContent', 'gridTemplateColumns', 'gridTemplateRows',
    'overflowX', 'overflowY', 'opacity', 'transform', 'zIndex', 'verticalAlign',
  ]
  const elements = [...document.querySelectorAll('body *')]
  return {
    text: document.body.innerText,
    elementCount: elements.length,
    structure: elements.map((element, index) =>
      `${index}:${element.tagName}:${element.children.length}:${element.getAttribute('aria-label') ?? ''}`),
    rects: elements.map((element) => {
      const rect = element.getBoundingClientRect()
      return [rect.x, rect.y, rect.width, rect.height].map((value) => Math.round(value * 2) / 2)
    }),
    styles: elements.map((element) => {
      const computed = getComputedStyle(element)
      return nonColorProps.map((property) => computed[property]).join('|')
    }).join('\u0001').split('\u0001'),
    document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
  }
}

function firstDifference(a, b) {
  if (a.length !== b.length) return `length ${a.length} vs ${b.length}`
  for (let i = 0; i < a.length; i += 1) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return `index ${i}: ${JSON.stringify(a[i])} vs ${JSON.stringify(b[i])}`
  }
  return ''
}

const browser = await chromium.launch({ headless: true })
const before = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const after = await browser.newPage({ viewport: { width: 1440, height: 900 } })
for (const [page, base] of [[before, beforeBase], [after, afterBase]]) {
  page.on('pageerror', (error) => errors.push(`${base}: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${base}: ${message.text()}`)
  })
}

async function load(page, base, route) {
  try {
    await page.goto(`${base}${route}`, { waitUntil: 'commit', timeout: 60000 })
    await page.locator('h1').first().waitFor({ timeout: 15000, state: 'attached' })
    await page.waitForTimeout(120)
  } catch (error) {
    console.log(`RETRY ${base}${route}: ${error.message.split('\n')[0]}`)
    await page.waitForTimeout(1000)
    await page.reload({ waitUntil: 'commit', timeout: 60000 })
    await page.locator('h1').first().waitFor({ timeout: 20000, state: 'attached' })
    await page.waitForTimeout(120)
  }
}

for (const viewport of viewports) {
  await Promise.all([
    before.setViewportSize({ width: viewport.width, height: viewport.height }),
    after.setViewportSize({ width: viewport.width, height: viewport.height }),
  ])

  const textMismatches = []
  const structureMismatches = []
  const geometryMismatches = []
  const styleMismatches = []
  const documentMismatches = []

  for (const route of routes) {
    await load(before, beforeBase, route)
    await load(after, afterBase, route)
    const a = await before.evaluate(snapshot)
    const b = await after.evaluate(snapshot)

    if (a.text !== b.text) textMismatches.push(route)
    const structureDiff = firstDifference(a.structure, b.structure) || firstDifference([a.elementCount], [b.elementCount])
    if (structureDiff) structureMismatches.push(`${route} (${structureDiff})`)
    const geometryDiff = firstDifference(a.rects, b.rects)
    if (geometryDiff) geometryMismatches.push(`${route} (${geometryDiff})`)
    const styleDiff = firstDifference(a.styles, b.styles)
    if (styleDiff) styleMismatches.push(`${route} (${styleDiff})`)
    if (a.document.join() !== b.document.join()) {
      documentMismatches.push(`${route} (${a.document.join()} vs ${b.document.join()})`)
    }
  }

  check(`${viewport.name}px: text content unchanged`, textMismatches.length === 0, textMismatches.join(', '))
  check(`${viewport.name}px: element structure/order unchanged`, structureMismatches.length === 0, structureMismatches.slice(0, 2).join(' | '))
  check(`${viewport.name}px: all element positions and sizes unchanged`, geometryMismatches.length === 0, geometryMismatches.slice(0, 2).join(' | '))
  check(`${viewport.name}px: non-color computed styles unchanged`, styleMismatches.length === 0, styleMismatches.slice(0, 2).join(' | '))
  check(`${viewport.name}px: document scroll dimensions unchanged`, documentMismatches.length === 0, documentMismatches.join(', '))
}

// Interactive dialogs/menus keep their dimensions too.
async function compareOpenState(name, route, openFn) {
  await load(before, beforeBase, route)
    await load(after, afterBase, route)
  await Promise.all([openFn(before), openFn(after)])
  await before.waitForTimeout(180)
  await after.waitForTimeout(180)
  const a = await before.evaluate(snapshot)
  const b = await after.evaluate(snapshot)
  const geometryDiff = firstDifference(a.rects, b.rects)
  const styleDiff = firstDifference(a.styles, b.styles)
  check(`${name}: dimensions and non-color styles unchanged`, !geometryDiff && !styleDiff, geometryDiff || styleDiff)
}

await Promise.all([
  before.setViewportSize({ width: 1440, height: 900 }),
  after.setViewportSize({ width: 1440, height: 900 }),
])
await compareOpenState('Inventory edit dialog', '/inventory', async (page) => {
  await page.locator('tbody tr').first().locator('[aria-label="Device actions"]').click()
  await page.getByRole('menuitem', { name: 'Edit details' }).click()
})
await compareOpenState('Add employee dialog', '/team', async (page) => {
  await page.getByRole('button', { name: 'Add employee' }).click()
})
await compareOpenState('Demo user dropdown', '/dashboard', async (page) => {
  await page.getByRole('button', { name: 'Switch demo role' }).click()
})
await compareOpenState('Store selector dropdown', '/dashboard', async (page) => {
  await page.locator('[aria-label="Select store"]:visible').click()
})

await Promise.all([
  before.setViewportSize({ width: 390, height: 844 }),
  after.setViewportSize({ width: 390, height: 844 }),
])
await compareOpenState('Mobile navigation drawer', '/dashboard', async (page) => {
  await page.getByRole('button', { name: 'Open navigation' }).click()
})

check('No console or page errors during parity comparison', errors.length === 0, errors.slice(0, 3).join(' | '))

await writeFile(
  'verification/layout-parity-results.json',
  JSON.stringify({ generatedAt: new Date().toISOString(), results, errors }, null, 2),
)
console.log(`\nLayout parity: ${results.filter((result) => result.status === 'PASS').length}/${results.length} checks passed.`)
await browser.close()
