#!/usr/bin/env pnpm exec tsx
/**
 * Query properties with filters
 * Usage: pnpm exec tsx db/scripts/query.ts [options]
 *
 * Options:
 *   --adults-only    Only adults-only properties
 *   --all-inclusive  Only all-inclusive properties
 *   --min-rating N   Minimum rating
 *   --max-price N    Maximum price in EUR
 *   --min-reviews N  Minimum review count
 *   --status S       Filter by status (new, promising, reviewed, booked, rejected)
 *   --limit N        Limit results (default: 20)
 *   --sort S         Sort by: value, price, rating, reviews (default: value)
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

function parseArgs(args: string[]) {
  const opts: Record<string, string | boolean> = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = args[i + 1]
      if (next && !next.startsWith('--')) {
        opts[key] = next
        i++
      } else {
        opts[key] = true
      }
    }
  }
  return opts
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))

  const conditions: string[] = []
  const params: (string | number)[] = []
  let paramIndex = 1

  if (opts['adults-only']) {
    conditions.push('is_adults_only = true')
  }
  if (opts['all-inclusive']) {
    conditions.push('is_all_inclusive = true')
  }
  if (opts['min-rating']) {
    conditions.push(`rating >= $${paramIndex++}`)
    params.push(parseFloat(opts['min-rating'] as string))
  }
  if (opts['max-price']) {
    conditions.push(`price_eur <= $${paramIndex++}`)
    params.push(parseInt(opts['max-price'] as string))
  }
  if (opts['min-reviews']) {
    conditions.push(`review_count >= $${paramIndex++}`)
    params.push(parseInt(opts['min-reviews'] as string))
  }
  if (opts['status']) {
    conditions.push(`status = $${paramIndex++}`)
    params.push(opts['status'] as string)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const sortMap: Record<string, string> = {
    value: 'value_score DESC NULLS LAST',
    price: 'price_eur ASC NULLS LAST',
    rating: 'rating DESC NULLS LAST',
    reviews: 'review_count DESC NULLS LAST',
  }
  const sort = sortMap[opts['sort'] as string] || sortMap.value
  const limit = parseInt(opts['limit'] as string) || 20

  const query = `
    SELECT id, name, price_eur, rating, review_count, value_score, status,
           is_adults_only as adults, is_all_inclusive as ai
    FROM properties
    ${whereClause}
    ORDER BY ${sort}
    LIMIT ${limit}
  `

  const result = await pool.query(query, params)

  console.log(`Found ${result.rowCount} properties:\n`)
  console.log('ID   | Price  | Rating | Reviews | Value  | Status     | Adults | AI | Name')
  console.log('─'.repeat(120))

  result.rows.forEach(p => {
    const id = String(p.id).padStart(4)
    const price = p.price_eur ? `€${p.price_eur}`.padStart(6) : '     -'
    const rating = p.rating ? String(p.rating).padStart(6) : '     -'
    const reviews = p.review_count ? String(p.review_count).padStart(7) : '      -'
    const value = p.value_score ? String(p.value_score).padStart(6) : '     -'
    const status = (p.status || 'new').padEnd(10)
    const adults = p.adults ? '  ✓   ' : '      '
    const ai = p.ai ? ' ✓' : '  '
    const name = p.name?.slice(0, 50) || ''
    console.log(`${id} | ${price} | ${rating} | ${reviews} | ${value} | ${status} | ${adults} | ${ai} | ${name}`)
  })

  await pool.end()
}

main().catch(console.error)
