import XLSX from 'xlsx'
import { readFileSync, writeFileSync } from 'fs'

const filePath = 'docs/evelina-research/2026.02 Egiptuse reis.xlsx'

// Read the Excel file
const workbook = XLSX.readFile(filePath)

// Print sheet names
console.log('Sheet names:', workbook.SheetNames)

// Parse each sheet
const result: Record<string, unknown[]> = {}

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  result[sheetName] = data

  console.log(`\n=== ${sheetName} ===`)
  console.log('Rows:', data.length)

  // Print first 20 rows for inspection
  const preview = data.slice(0, 20)
  for (let i = 0; i < preview.length; i++) {
    const row = preview[i] as string[]
    if (row.some(cell => cell !== '')) {
      console.log(`Row ${i}:`, row)
    }
  }
}

// Save as JSON for reference
writeFileSync('docs/evelina-research/parsed-data.json', JSON.stringify(result, null, 2))
console.log('\nSaved parsed data to docs/evelina-research/parsed-data.json')
