#!/usr/bin/env pnpm exec tsx
/**
 * Add metadata to a property
 * Usage: pnpm exec tsx db/scripts/add-metadata.ts <property_id|url> <key> <value> [source]
 *
 * Examples:
 *   pnpm exec tsx db/scripts/add-metadata.ts 65 has_twin_beds true booking
 *   pnpm exec tsx db/scripts/add-metadata.ts 65 noise_level "quiet at night" manual
 *   pnpm exec tsx db/scripts/add-metadata.ts "xperience-golden" bed_bug_reports 0 tripadvisor
 */

import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  host: 'localhost',
  port: 5623,
  user: 'travel',
  password: 'dream2026',
  database: 'travel_dream',
})

async function main() {
  const [,, idOrUrl, key, value, source = 'manual'] = process.argv

  if (!idOrUrl || !key || value === undefined) {
    console.log('Usage: add-metadata.ts <property_id|url_fragment> <key> <value> [source]')
    process.exit(1)
  }

  // Find property
  let propertyId: number
  if (/^\d+$/.test(idOrUrl)) {
    propertyId = parseInt(idOrUrl)
  } else {
    const result = await pool.query(
      'SELECT id, name FROM properties WHERE booking_url ILIKE $1 LIMIT 1',
      [`%${idOrUrl}%`]
    )
    if (result.rows.length === 0) {
      console.error(`Property not found: ${idOrUrl}`)
      process.exit(1)
    }
    propertyId = result.rows[0].id
    console.log(`Found: ${result.rows[0].name} (ID: ${propertyId})`)
  }

  // Determine value type
  let valueBool: boolean | null = null
  let valueNumeric: number | null = null
  let valueJson: object | null = null
  let valueText: string | null = value

  if (value === 'true' || value === 'false') {
    valueBool = value === 'true'
    valueText = null
  } else if (!isNaN(parseFloat(value)) && isFinite(Number(value))) {
    valueNumeric = parseFloat(value)
    valueText = null
  } else if (value.startsWith('{') || value.startsWith('[')) {
    try {
      valueJson = JSON.parse(value)
      valueText = null
    } catch {}
  }

  await pool.query(
    `INSERT INTO property_metadata (property_id, key, value, value_bool, value_numeric, value_json, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (property_id, key, source) DO UPDATE SET
       value = EXCLUDED.value,
       value_bool = EXCLUDED.value_bool,
       value_numeric = EXCLUDED.value_numeric,
       value_json = EXCLUDED.value_json`,
    [propertyId, key, valueText, valueBool, valueNumeric, valueJson ? JSON.stringify(valueJson) : null, source]
  )

  console.log(`✅ Added metadata: ${key} = ${value} (source: ${source})`)
  await pool.end()
}

main().catch(console.error)
