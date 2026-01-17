#!/usr/bin/env npx tsx
/**
 * Seed the travel_dream database with property data
 * Usage: npx tsx db/seed.ts
 */

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: 'localhost',
  port: 5623,
  user: 'travel',
  password: 'dream2026',
  database: 'travel_dream',
})

interface JsonlProperty {
  n: string // name
  p: number | null // price
  r: number | null // rating
  c: number | null // review count
  u: string // url
}

interface OptionJson {
  id: string
  type: string
  name: string
  provider: string
  url: string
  pricing?: {
    total: number
    allInclusive: boolean
  }
  rating?: {
    score: number
    reviewCount: number
  }
  scores?: {
    location?: number
    value?: number
    quality?: number
    reliability?: number
    separateSleeping?: number
    quietness?: number
    foodConvenience?: number
    amenities?: number
    overall?: number
  }
  pros?: string[]
  cons?: string[]
  dealbreakers?: string[]
  adultsOnly?: boolean
  location?: {
    area?: string
    beachDistance?: string
  }
  verdict?: string
  notes?: string
}

async function seedFromJsonl() {
  const jsonlPath = join(__dirname, '..', 'playwright-logs', 'all-properties.jsonl')
  const content = readFileSync(jsonlPath, 'utf-8')
  const lines = content.trim().split('\n')

  console.log(`Importing ${lines.length} properties from JSONL...`)

  let imported = 0
  for (const line of lines) {
    try {
      const p: JsonlProperty = JSON.parse(line)

      await pool.query(
        `INSERT INTO properties (booking_url, name, price_eur, rating, review_count, raw_data)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (booking_url) DO UPDATE SET
           name = EXCLUDED.name,
           price_eur = EXCLUDED.price_eur,
           rating = EXCLUDED.rating,
           review_count = EXCLUDED.review_count,
           raw_data = EXCLUDED.raw_data,
           updated_at = NOW()`,
        [p.u, p.n, p.p, p.r, p.c, JSON.stringify(p)]
      )
      imported++
    } catch (err) {
      console.error(`Failed to import line: ${line.slice(0, 100)}...`, err)
    }
  }

  console.log(`Imported ${imported} properties from JSONL`)
}

async function seedFromOptions() {
  const optionsDir = join(__dirname, '..', 'docs', 'options')
  const files = readdirSync(optionsDir).filter(f => f.startsWith('option-') && f.endsWith('.json'))

  console.log(`Importing ${files.length} detailed option files...`)

  let imported = 0
  for (const file of files) {
    try {
      const content = readFileSync(join(optionsDir, file), 'utf-8')
      const opt: OptionJson = JSON.parse(content)

      // Update existing property or insert new one
      const result = await pool.query(
        `UPDATE properties SET
           status = 'reviewed',
           is_all_inclusive = $2,
           is_adults_only = $3,
           score_location = $4,
           score_value = $5,
           score_quality = $6,
           score_reliability = $7,
           score_separate_sleeping = $8,
           score_quietness = $9,
           score_food_convenience = $10,
           score_amenities = $11,
           score_overall = $12,
           pros = $13,
           cons = $14,
           dealbreakers = $15,
           verdict = $16,
           notes = $17,
           area = $18,
           beach_distance = $19,
           raw_data = raw_data || $20::jsonb
         WHERE booking_url = $1
         RETURNING id`,
        [
          opt.url,
          opt.pricing?.allInclusive ?? null,
          opt.adultsOnly ?? null,
          opt.scores?.location ?? null,
          opt.scores?.value ?? null,
          opt.scores?.quality ?? null,
          opt.scores?.reliability ?? null,
          opt.scores?.separateSleeping ?? null,
          opt.scores?.quietness ?? null,
          opt.scores?.foodConvenience ?? null,
          opt.scores?.amenities ?? null,
          opt.scores?.overall ?? null,
          opt.pros ?? null,
          opt.cons ?? null,
          opt.dealbreakers ?? null,
          opt.verdict ?? null,
          opt.notes ?? null,
          opt.location?.area ?? null,
          opt.location?.beachDistance ?? null,
          JSON.stringify({ optionId: opt.id, optionType: opt.type, fullOption: opt }),
        ]
      )

      if (result.rowCount === 0) {
        // Property doesn't exist yet, insert it
        await pool.query(
          `INSERT INTO properties (
             booking_url, name, price_eur, rating, review_count,
             status, is_all_inclusive, is_adults_only,
             score_location, score_value, score_quality, score_reliability,
             score_separate_sleeping, score_quietness, score_food_convenience, score_amenities,
             score_overall, pros, cons, dealbreakers, verdict, notes,
             area, beach_distance, raw_data
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)`,
          [
            opt.url,
            opt.name,
            opt.pricing?.total ?? null,
            opt.rating?.score ?? null,
            opt.rating?.reviewCount ?? null,
            'reviewed',
            opt.pricing?.allInclusive ?? null,
            opt.adultsOnly ?? null,
            opt.scores?.location ?? null,
            opt.scores?.value ?? null,
            opt.scores?.quality ?? null,
            opt.scores?.reliability ?? null,
            opt.scores?.separateSleeping ?? null,
            opt.scores?.quietness ?? null,
            opt.scores?.foodConvenience ?? null,
            opt.scores?.amenities ?? null,
            opt.scores?.overall ?? null,
            opt.pros ?? null,
            opt.cons ?? null,
            opt.dealbreakers ?? null,
            opt.verdict ?? null,
            opt.notes ?? null,
            opt.location?.area ?? null,
            opt.location?.beachDistance ?? null,
            JSON.stringify({ optionId: opt.id, optionType: opt.type, fullOption: opt }),
          ]
        )
      }

      imported++
    } catch (err) {
      console.error(`Failed to import ${file}:`, err)
    }
  }

  console.log(`Imported ${imported} detailed options`)
}

async function createInitialSearch() {
  // Record the search we did
  const result = await pool.query(
    `INSERT INTO searches (destination, checkin, checkout, adults, rooms, total_results, filters)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      'Sharm El Sheikh',
      '2026-02-15',
      '2026-02-22',
      2,
      2,
      480,
      JSON.stringify({ currency: 'EUR', source: 'booking.com' }),
    ]
  )

  const searchId = result.rows[0].id

  // Link all properties to this search
  await pool.query(
    `INSERT INTO search_properties (search_id, property_id, position)
     SELECT $1, id, ROW_NUMBER() OVER (ORDER BY value_score DESC NULLS LAST)
     FROM properties
     ON CONFLICT DO NOTHING`,
    [searchId]
  )

  console.log(`Created search record with ID ${searchId}`)
}

async function printStats() {
  const stats = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
      COUNT(*) FILTER (WHERE is_adults_only = true) as adults_only,
      COUNT(*) FILTER (WHERE is_all_inclusive = true) as all_inclusive,
      COUNT(*) FILTER (WHERE rating >= 9) as excellent,
      ROUND(AVG(price_eur)) as avg_price,
      ROUND(AVG(rating)::numeric, 1) as avg_rating
    FROM properties
  `)

  console.log('\n📊 Database Stats:')
  console.log('─'.repeat(40))
  const s = stats.rows[0]
  console.log(`Total properties: ${s.total}`)
  console.log(`Reviewed in detail: ${s.reviewed}`)
  console.log(`Adults-only: ${s.adults_only}`)
  console.log(`All-inclusive: ${s.all_inclusive}`)
  console.log(`Excellent (9+): ${s.excellent}`)
  console.log(`Avg price: €${s.avg_price}`)
  console.log(`Avg rating: ${s.avg_rating}`)
}

async function main() {
  console.log('🏨 Seeding travel_dream database...\n')

  try {
    await seedFromJsonl()
    await seedFromOptions()
    await createInitialSearch()
    await printStats()

    console.log('\n✅ Seeding complete!')
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
