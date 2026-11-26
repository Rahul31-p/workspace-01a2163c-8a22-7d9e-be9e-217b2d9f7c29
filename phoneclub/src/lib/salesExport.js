import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import { stores as seedStores } from '@/data/mockData'
import { getStoreName } from '@/data/selectors'
import { saleAmount, saleGrossProfit, saleProfitMargin } from '@/data/salesSelectors'

const headers = [
  'Invoice Number',
  'Mobile Model',
  'IMEI',
  'Store',
  'Sale Date',
  'Selling Price',
  'Payment Method',
  'Gross Profit',
  'Profit Margin (%)',
]

function exportRows(sales, storeOptions) {
  return sales.map((sale) => ({
    'Invoice Number': sale.invoiceNumber,
    'Mobile Model': sale.model,
    IMEI: sale.imei,
    Store: getStoreName(sale.storeId, storeOptions),
    'Sale Date': sale.date,
    'Selling Price': saleAmount(sale),
    'Payment Method': sale.paymentMethod,
    'Gross Profit': saleGrossProfit(sale),
    'Profit Margin (%)': saleProfitMargin(sale),
  }))
}

export function exportSalesToExcel(sales, filename = 'phoneclub-sales.xlsx', storeOptions = seedStores) {
  const rows = exportRows(sales, storeOptions)
  const worksheet = rows.length
    ? XLSX.utils.json_to_sheet(rows)
    : XLSX.utils.aoa_to_sheet([headers])

  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales')
  XLSX.writeFile(workbook, filename)
}

function inr(value) {
  return `INR ${Number(value).toLocaleString('en-IN')}`
}

function truncate(value, max) {
  const text = String(value ?? '')
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function exportSalesToPdf(sales, filename = 'phoneclub-sales.pdf', storeOptions = seedStores) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const widths = [80, 112, 100, 82, 68, 84, 78, 84, 72]
  const rowHeight = 22
  const margin = 36

  const drawHeader = (y) => {
    doc.setFillColor(241, 245, 249)
    doc.rect(margin, y, widths.reduce((sum, width) => sum + width, 0), rowHeight, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    let x = margin + 4

    headers.forEach((header, index) => {
      doc.text(header, x, y + 14)
      x += widths[index]
    })
    doc.setFont('helvetica', 'normal')
    return y + rowHeight
  }

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PHONECLUB - Sales History', margin, 32)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`${sales.length} transaction(s) exported on ${new Date().toLocaleDateString('en-IN')}`, margin, 48)

  let y = drawHeader(62)

  sales.forEach((sale) => {
    if (y > 530) {
      doc.addPage()
      y = drawHeader(50)
    }

    const values = [
      sale.invoiceNumber,
      sale.model,
      sale.imei,
      getStoreName(sale.storeId, storeOptions),
      sale.date,
      inr(saleAmount(sale)),
      sale.paymentMethod,
      inr(saleGrossProfit(sale)),
      `${saleProfitMargin(sale)}%`,
    ]

    let x = margin + 4
    doc.setFontSize(8)
    values.forEach((value, index) => {
      doc.text(truncate(value, Math.floor(widths[index] / 4.4)), x, y + 14)
      x += widths[index]
    })

    doc.setDrawColor(229, 233, 240)
    doc.line(margin, y + rowHeight, margin + widths.reduce((sum, width) => sum + width, 0), y + rowHeight)
    y += rowHeight
  })

  doc.save(filename)
}
