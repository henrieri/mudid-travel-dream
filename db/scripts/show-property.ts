#!/usr/bin/env pnpm exec tsx
/**
 * Show property details
 * Usage: pnpm exec tsx db/scripts/show-property.ts <property_id|url_fragment>
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
  const [,, idOrUrl] = process.argv

  if (!idOrUrl) {
    console.log('Usage: show-property.ts <property_id|url_fragment>')
    process.exit(1)
  }

  let whereClause: string
  let params: (string | number)[]

  if (/^\d+$/.test(idOrUrl)) {
    whereClause = 'id = $1'
    params = [parseInt(idOrUrl)]
  } else {
    whereClause = 'booking_url ILIKE $1'
    params = [`%${idOrUrl}%`]
  }

  const result = await pool.query(`SELECT * FROM properties WHERE ${whereClause} LIMIT 1`, params)

  if (result.rows.length === 0) {
    console.error(`Property not found: ${idOrUrl}`)
    process.exit(1)
  }

  const p = result.rows[0]

  console.log('═'.repeat(60))
  console.log(`${p.name}`)
  console.log('═'.repeat(60))
  console.log(`ID: ${p.id} | Status: ${p.status}`)
  console.log(`Price: €${p.price_eur} | Rating: ${p.rating} | Reviews: ${p.review_count}`)
  console.log(`Value Score: ${p.value_score}`)
  console.log(`URL: ${p.booking_url}`)
  console.log('')

  if (p.is_adults_only !== null || p.is_all_inclusive !== null) {
    console.log('Attributes:')
    if (p.is_adults_only) console.log('  ✓ Adults-only')
    if (p.is_all_inclusive) console.log('  ✓ All-inclusive')
    if (p.has_twin_beds) console.log('  ✓ Twin beds available')
    if (p.has_separate_rooms) console.log('  ✓ Separate rooms')
    console.log('')
  }

  if (p.score_overall) {
    console.log('Scores (1-5):')
    if (p.score_location) console.log(`  Location: ${p.score_location}`)
    if (p.score_value) console.log(`  Value: ${p.score_value}`)
    if (p.score_quality) console.log(`  Quality: ${p.score_quality}`)
    if (p.score_quietness) console.log(`  Quietness: ${p.score_quietness}`)
    if (p.score_amenities) console.log(`  Amenities: ${p.score_amenities}`)
    console.log(`  Overall: ${p.score_overall}`)
    console.log('')
  }

  if (p.pros?.length) {
    console.log('Pros:')
    p.pros.forEach((pro: string) => console.log(`  + ${pro}`))
    console.log('')
  }

  if (p.cons?.length) {
    console.log('Cons:')
    p.cons.forEach((con: string) => console.log(`  - ${con}`))
    console.log('')
  }

  if (p.verdict) {
    console.log(`Verdict: ${p.verdict}`)
    console.log('')
  }

  // Get metadata
  const metaResult = await pool.query(
    'SELECT key, value, value_bool, value_numeric, source FROM property_metadata WHERE property_id = $1 ORDER BY key',
    [p.id]
  )

  if (metaResult.rows.length > 0) {
    console.log('Metadata:')
    metaResult.rows.forEach(m => {
      const val = m.value_bool !== null ? m.value_bool : m.value_numeric !== null ? m.value_numeric : m.value
      console.log(`  ${m.key}: ${val} (${m.source})`)
    })
  }

  await pool.end()
}

main().catch(console.error)
