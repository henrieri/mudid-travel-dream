#!/usr/bin/env pnpm exec tsx
/**
 * Set property status
 * Usage: pnpm exec tsx db/scripts/set-status.ts <property_id|url> <status>
 *
 * Status: new, promising, reviewed, booked, rejected
 *
 * Examples:
 *   pnpm exec tsx db/scripts/set-status.ts 65 promising
 *   pnpm exec tsx db/scripts/set-status.ts "golden-sandy" reviewed
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

const VALID_STATUSES = ['new', 'promising', 'reviewed', 'booked', 'rejected']

async function main() {
  const [,, idOrUrl, status] = process.argv

  if (!idOrUrl || !status) {
    console.log('Usage: set-status.ts <property_id|url_fragment> <status>')
    console.log(`Status options: ${VALID_STATUSES.join(', ')}`)
    process.exit(1)
  }

  if (!VALID_STATUSES.includes(status)) {
    console.error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`)
    process.exit(1)
  }

  let whereClause: string
  let params: (string | number)[]

  if (/^\d+$/.test(idOrUrl)) {
    whereClause = 'id = $1'
    params = [parseInt(idOrUrl), status]
  } else {
    whereClause = 'booking_url ILIKE $1'
    params = [`%${idOrUrl}%`, status]
  }

  const result = await pool.query(
    `UPDATE properties SET status = $2 WHERE ${whereClause} RETURNING id, name, status`,
    params
  )

  if (result.rows.length === 0) {
    console.error(`Property not found: ${idOrUrl}`)
    process.exit(1)
  }

  console.log(`✅ Updated: ${result.rows[0].name}`)
  console.log(`   Status: ${result.rows[0].status}`)
  await pool.end()
}

main().catch(console.error)
