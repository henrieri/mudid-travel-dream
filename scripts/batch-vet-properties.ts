#!/usr/bin/env pnpm exec tsx
/**
 * Batch vet properties - extracts key info for decision making
 * Outputs JSON that can be imported into the database
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

interface PropertyInfo {
  id: number
  name: string
  rating: number
  review_count: number
  price_eur: number
  booking_url: string
  // To be filled by browser
  has_twin_beds?: boolean
  has_separate_rooms?: boolean
  is_adults_only?: boolean
  beach_distance?: string
  airport_distance?: string
  highlights?: string[]
}

async function getUnvettedProperties(limit: number = 50): Promise<PropertyInfo[]> {
  const result = await pool.query(`
    SELECT id, name, rating, review_count, price_eur, booking_url
    FROM properties
    WHERE status = 'new'
      AND rating >= 9.0
      AND review_count >= 100
    ORDER BY rating DESC, review_count DESC
    LIMIT $1
  `, [limit])

  return result.rows
}

async function main() {
  const properties = await getUnvettedProperties(50)

  console.log('Properties to vet:')
  console.log('==================')

  for (const p of properties) {
    const adultsHint = p.name.toLowerCase().includes('adult') ? '👤 ADULTS' : ''
    console.log(`[${p.id}] ${p.rating} ⭐ (${p.review_count} reviews) €${p.price_eur} ${adultsHint}`)
    console.log(`    ${p.name}`)
    console.log(`    ${p.booking_url}`)
    console.log('')
  }

  console.log(`Total: ${properties.length} properties to vet`)

  // Output URLs for batch processing
  console.log('\n\nURLs for batch processing:')
  console.log('==========================')
  properties.forEach(p => {
    console.log(`${p.id}|${p.booking_url}`)
  })

  await pool.end()
}

main().catch(console.error)
