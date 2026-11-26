import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import { getReportRecordSummary } from '@/data/reportSelectors'
import { formatCurrency, formatNumber } from '@/lib/format'

const summaryRows = ({ scope, range, salesMetrics, inventoryMetrics }) => [
  ['Report', 'PHONECLUB Reports & Analytics'],
  ['Generated', new Date().toLocaleString('en-IN')],
  ['Store', scope],
  ['Period', range.label],
  ['Date from', range.from],
  ['Date to', range.to],
  [],
  ['SALES SUMMARY', ''],
  ['Total revenue', salesMetrics.totalRevenue],
  ['Total profit', salesMetrics.totalProfit],
  ['Average selling price', salesMetrics.averageSellingPrice],
  ['Transactions', salesMetrics.transactions],
  ['Profit margin (%)', salesMetrics.margin],
  [],
  ['INVENTORY SUMMARY', ''],
  ['Total mobiles purchased', inventoryMetrics.totalPurchased],
  ['Total available mobiles', inventoryMetrics.available],
  ['Total sold mobiles', inventoryMetrics.sold],
  ['Reserved mobiles', inventoryMetrics.reserved],
  ['Total purchase value', inventoryMetrics.purchaseValue],
]

function sheetFromRows(rows, fallbackHeaders) {
  return rows.length ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([fallbackHeaders])
}

export function exportReportToExcel(report, filename = 'phoneclub-report.xlsx') {
  const { scope, range, sales, inventory, storeRows, salesMetrics, inventoryMetrics, storeOptions } = report
  const records = getReportRecordSummary({ sales, inventory, storeOptions })
  const workbook = XLSX.utils.book_new()

  const summary = XLSX.utils.aoa_to_sheet(summaryRows({ scope, range, salesMetrics, inventoryMetrics }))
  summary['!cols'] = [{ wch: 28 }, { wch: 24 }]
  XLSX.utils.book_append_sheet(workbook, summary, 'Summary')

  const salesSheet = sheetFromRows(records.sales, Object.keys(records.sales[0] ?? { 'Invoice Number': '', IMEI: '' }))
  salesSheet['!cols'] = [
    { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 18 },
    { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 18 },
  ]
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales records')

  const inventorySheet = sheetFromRows(
    records.inventory,
    Object.keys(records.inventory[0] ?? { 'Device ID': '', IMEI: '' }),
  )
  inventorySheet['!cols'] = [
    { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 12 }, { wch: 20 },
    { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 16 },
  ]
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory records')

  const storeSheet = sheetFromRows(
    storeRows.map((row) => ({
      Store: row.name,
      Revenue: row.revenue,
      'Units Sold': row.units,
      'Gross Profit': row.grossProfit,
      'Inventory Value': row.inventoryValue,
      'Available Mobiles': row.available,
      'Total Devices': row.devices,
    })),
    ['Store', 'Revenue', 'Units Sold', 'Gross Profit', 'Inventory Value', 'Available Mobiles', 'Total Devices'],
  )
  storeSheet['!cols'] = [
    { wch: 20 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 14 },
  ]
  XLSX.utils.book_append_sheet(workbook, storeSheet, 'Store comparison')

  XLSX.writeFile(workbook, filename)
}

function truncate(value, maxChars) {
  const text = String(value ?? '')
  return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text
}

function inr(value) {
  return `INR ${Number(value).toLocaleString('en-IN')}`
}

export function exportReportToPdf(report, filename = 'phoneclub-report.pdf') {
  const { scope, range, sales, inventory, storeRows, salesMetrics, inventoryMetrics, storeOptions } = report
  const records = getReportRecordSummary({ sales, inventory, storeOptions })
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 36
  let y = 36

  const ensureSpace = (height) => {
    if (y + height <= 540) return
    doc.addPage()
    y = 44
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text('PHONECLUB - Reports & Analytics', margin, y)
  y += 18
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`${scope} · ${range.label} · ${range.from} to ${range.to}`, margin, y)
  y += 20

  doc.setFillColor(241, 245, 249)
  doc.rect(margin, y, pageWidth - margin * 2, 66, 'F')
  const metrics = [
    ['Revenue', formatCurrency(salesMetrics.totalRevenue)],
    ['Profit', formatCurrency(salesMetrics.totalProfit)],
    ['Avg selling price', formatCurrency(salesMetrics.averageSellingPrice)],
    ['Transactions', formatNumber(salesMetrics.transactions)],
    ['Purchased', formatNumber(inventoryMetrics.totalPurchased)],
    ['Purchase value', formatCurrency(inventoryMetrics.purchaseValue)],
  ]
  metrics.forEach(([label, value], index) => {
    const x = margin + 14 + (index % 3) * ((pageWidth - margin * 2 - 28) / 3)
    const rowY = y + 16 + Math.floor(index / 3) * 30
    doc.setFontSize(8)
    doc.text(label.toUpperCase(), x, rowY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(value, x, rowY + 14)
    doc.setFont('helvetica', 'normal')
  })
  y += 82

  const drawTable = (title, headers, rows, widths, values) => {
    if (!rows.length) return
    ensureSpace(70)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(title, margin, y)
    y += 10

    const drawHeader = () => {
      doc.setFillColor(241, 245, 249)
      doc.rect(margin, y, widths.reduce((sum, width) => sum + width, 0), 18, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      let x = margin + 4
      headers.forEach((header, index) => {
        doc.text(header, x, y + 12)
        x += widths[index]
      })
      doc.setFont('helvetica', 'normal')
      y += 18
    }

    drawHeader()

    rows.forEach((row) => {
      if (y > 520) {
        doc.addPage()
        y = 44
        drawHeader()
      }

      let x = margin + 4
      values(row).forEach((value, index) => {
        doc.setFontSize(7.5)
        doc.text(truncate(value, Math.max(10, Math.floor(widths[index] / 4.2))), x, y + 12)
        x += widths[index]
      })
      doc.setDrawColor(229, 233, 240)
      doc.line(margin, y + 18, margin + widths.reduce((sum, width) => sum + width, 0), y + 18)
      y += 18
    })

    y += 16
  }

  drawTable(
    `Sales records (${records.sales.length})`,
    ['Invoice', 'Date', 'Store', 'Model', 'IMEI', 'Payment', 'Selling', 'Profit'],
    records.sales,
    [82, 66, 100, 120, 116, 82, 82, 82],
    (row) => [
      row['Invoice Number'], row['Sale Date'], row.Store, `${row.Brand} ${row.Model}`,
      row.IMEI, row['Payment Method'], inr(row['Selling Price']), inr(row['Gross Profit']),
    ],
  )

  drawTable(
    `Inventory records (${records.inventory.length})`,
    ['Device ID', 'Purchased', 'Store', 'Model', 'IMEI', 'Status', 'Price'],
    records.inventory,
    [92, 70, 100, 132, 128, 80, 88],
    (row) => [
      row['Device ID'], row['Purchase Date'], row.Store, `${row.Brand} ${row.Model}`,
      row.IMEI, row.Status, inr(row['Purchase Price']),
    ],
  )

  drawTable(
    `Store comparison (${storeRows.length})`,
    ['Store', 'Revenue', 'Units', 'Gross profit', 'Inventory value', 'Available'],
    storeRows,
    [130, 110, 70, 120, 130, 80],
    (row) => [
      row.name, inr(row.revenue), formatNumber(row.units), inr(row.grossProfit),
      inr(row.inventoryValue), formatNumber(row.available),
    ],
  )

  doc.save(filename)
}
