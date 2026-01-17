#!/usr/bin/env pnpm exec tsx
/**
 * Calculate Henri & Evelina scores for all vetted properties
 * Based on scoring criteria in docs/options/SCORING.md
 *
 * Usage: pnpm exec tsx db/scripts/calculate-scores.ts [--dry-run]
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

interface PropertyWithMeta {
  id: number
  name: string
  rating: number | null
  review_count: number | null
  is_adults_only: boolean | null
  is_all_inclusive: boolean | null
  has_twin_beds: boolean | null
  // Metadata fields (fetched separately)
  meta: Record<string, string | boolean | number | null>
}

interface ScoreBreakdown {
  snoring_isolation: number
  beach_access: number
  rating_quality: number
  adults_only: number
  all_inclusive: number
  amenities: number
  reliability: number
  total: number
  tier: string
  explanation: string
}

function calculateSnoringIsolation(meta: Record<string, any>): { score: number; reason: string } {
  // Best: 2+ bedroom apartment/villa = 35
  if (meta.has_2bedroom_apartment || meta.has_2bedroom_villa ||
      meta.has_3bedroom_villa || meta.has_4bedroom_villa ||
      meta['has_2bedroom_villa_private_pool']) {
    return { score: 35, reason: '2+ bedroom apartment/villa (35pts)' }
  }

  // 2-bedroom suite = 30
  if (meta.has_2bedroom_suite) {
    return { score: 30, reason: '2-bedroom suite (30pts)' }
  }

  // Interconnecting rooms = 25
  if (meta.has_interconnecting_rooms) {
    return { score: 25, reason: 'Interconnecting rooms (25pts)' }
  }

  // Suite with separate bedroom = 20
  if (meta.has_separate_bedroom_suite || meta.has_suite_with_bedroom || meta.has_separate_bedroom) {
    return { score: 20, reason: 'Suite with separate bedroom (20pts)' }
  }

  // Twin beds only = 10
  if (meta.has_twin_beds) {
    return { score: 10, reason: 'Twin beds only (10pts)' }
  }

  return { score: 0, reason: 'No isolation option found (0pts)' }
}

function calculateBeachAccess(meta: Record<string, any>): { score: number; reason: string } {
  // Check beachfront flag first
  if (meta.is_beachfront) {
    return { score: 15, reason: 'Beachfront (15pts)' }
  }

  // Parse beach_distance
  const distance = meta.beach_distance as string
  if (!distance) {
    return { score: 0, reason: 'Beach distance unknown (0pts)' }
  }

  const lowerDist = distance.toLowerCase()

  // Check for beachfront keywords
  if (lowerDist.includes('beachfront') || lowerDist.includes('0m') || lowerDist === 'beachfront') {
    return { score: 15, reason: `Beachfront: ${distance} (15pts)` }
  }

  // Parse numeric distance
  const match = lowerDist.match(/(\d+(?:\.\d+)?)\s*(km|m)/i)
  if (match) {
    const value = parseFloat(match[1])
    const unit = match[2].toLowerCase()
    const meters = unit === 'km' ? value * 1000 : value

    if (meters <= 100) return { score: 12, reason: `Beach ${distance} (12pts)` }
    if (meters <= 500) return { score: 8, reason: `Beach ${distance} (8pts)` }
    if (meters <= 1000) return { score: 5, reason: `Beach ${distance} (5pts)` }
    return { score: 2, reason: `Beach ${distance} - far (2pts)` }
  }

  return { score: 0, reason: `Beach distance: ${distance} - unparseable (0pts)` }
}

function calculateRatingQuality(rating: number | null): { score: number; reason: string } {
  if (!rating) return { score: 0, reason: 'No rating (0pts)' }

  if (rating >= 9.5) return { score: 15, reason: `Rating ${rating} >= 9.5 (15pts)` }
  if (rating >= 9.0) return { score: 12, reason: `Rating ${rating} >= 9.0 (12pts)` }
  if (rating >= 8.5) return { score: 8, reason: `Rating ${rating} >= 8.5 (8pts)` }
  if (rating >= 8.0) return { score: 4, reason: `Rating ${rating} >= 8.0 (4pts)` }
  return { score: 0, reason: `Rating ${rating} < 8.0 (0pts)` }
}

function calculateAdultsOnly(isAdultsOnly: boolean | null, meta: Record<string, any>): { score: number; reason: string } {
  if (isAdultsOnly === true || meta.is_adults_only === true) {
    return { score: 10, reason: 'Adults-only (10pts)' }
  }
  return { score: 0, reason: 'Families allowed (0pts)' }
}

function calculateAllInclusive(isAllInclusive: boolean | null, meta: Record<string, any>): { score: number; reason: string } {
  if (isAllInclusive === true || meta.is_all_inclusive === true) {
    return { score: 10, reason: 'All-inclusive (10pts)' }
  }
  return { score: 0, reason: 'Not all-inclusive (0pts)' }
}

function calculateAmenities(meta: Record<string, any>): { score: number; reason: string } {
  let score = 0
  const reasons: string[] = []

  // Pool(s): +3
  if (meta.has_pool || meta.has_27_pools) {
    score += 3
    reasons.push('pool +3')
  }

  // Private pool: +3
  if (meta.has_private_pool || meta['has_villas_private_pool']) {
    score += 3
    reasons.push('private pool +3')
  }

  // Water park: +2
  if (meta.has_water_park) {
    score += 2
    reasons.push('water park +2')
  }

  // Spa: +2 (assumed if high-end based on name/rating)
  // We don't have explicit spa data yet, so we'll assume beachfront resorts have it

  // Cap at 10
  score = Math.min(score, 10)

  if (reasons.length === 0) {
    return { score: 0, reason: 'No amenity data (0pts)' }
  }

  return { score, reason: `Amenities: ${reasons.join(', ')} (${score}pts)` }
}

function calculateReliability(reviewCount: number | null): { score: number; reason: string } {
  if (!reviewCount) return { score: 0, reason: 'No reviews (0pts)' }

  if (reviewCount >= 2000) return { score: 5, reason: `${reviewCount} reviews >= 2000 (5pts)` }
  if (reviewCount >= 1000) return { score: 4, reason: `${reviewCount} reviews >= 1000 (4pts)` }
  if (reviewCount >= 500) return { score: 3, reason: `${reviewCount} reviews >= 500 (3pts)` }
  if (reviewCount >= 100) return { score: 2, reason: `${reviewCount} reviews >= 100 (2pts)` }
  return { score: 0, reason: `${reviewCount} reviews < 100 (0pts)` }
}

function getTier(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Very Good'
  if (score >= 50) return 'Good'
  if (score >= 35) return 'Average'
  return 'Poor'
}

function calculateScore(prop: PropertyWithMeta): ScoreBreakdown {
  const snoring = calculateSnoringIsolation(prop.meta)
  const beach = calculateBeachAccess(prop.meta)
  const rating = calculateRatingQuality(prop.rating)
  const adults = calculateAdultsOnly(prop.is_adults_only, prop.meta)
  const allInc = calculateAllInclusive(prop.is_all_inclusive, prop.meta)
  const amenities = calculateAmenities(prop.meta)
  const reliability = calculateReliability(prop.review_count)

  const total = snoring.score + beach.score + rating.score + adults.score +
                allInc.score + amenities.score + reliability.score

  const explanation = [
    `Snoring: ${snoring.reason}`,
    `Beach: ${beach.reason}`,
    `Rating: ${rating.reason}`,
    `Adults: ${adults.reason}`,
    `AI: ${allInc.reason}`,
    `Amenities: ${amenities.reason}`,
    `Reviews: ${reliability.reason}`,
  ].join(' | ')

  return {
    snoring_isolation: snoring.score,
    beach_access: beach.score,
    rating_quality: rating.score,
    adults_only: adults.score,
    all_inclusive: allInc.score,
    amenities: amenities.score,
    reliability: reliability.score,
    total,
    tier: getTier(total),
    explanation,
  }
}

async function getPropertyMetadata(propertyId: number): Promise<Record<string, any>> {
  const result = await pool.query(
    'SELECT key, value, value_bool, value_numeric FROM property_metadata WHERE property_id = $1',
    [propertyId]
  )

  const meta: Record<string, any> = {}
  for (const row of result.rows) {
    if (row.value_bool !== null) {
      meta[row.key] = row.value_bool
    } else if (row.value_numeric !== null) {
      meta[row.key] = row.value_numeric
    } else {
      meta[row.key] = row.value
    }
  }
  return meta
}

async function saveScore(propertyId: number, breakdown: ScoreBreakdown, dryRun: boolean) {
  if (dryRun) return

  // Delete existing calculated scores for this property
  await pool.query(`
    DELETE FROM property_metadata
    WHERE property_id = $1 AND source = 'calculated'
  `, [propertyId])

  // Save total score
  await pool.query(`
    INSERT INTO property_metadata (property_id, key, value_numeric, source, created_at)
    VALUES ($1, 'henri_score', $2, 'calculated', NOW())
  `, [propertyId, breakdown.total])

  // Save tier
  await pool.query(`
    INSERT INTO property_metadata (property_id, key, value, source, created_at)
    VALUES ($1, 'henri_tier', $2, 'calculated', NOW())
  `, [propertyId, breakdown.tier])

  // Save explanation
  await pool.query(`
    INSERT INTO property_metadata (property_id, key, value, source, created_at)
    VALUES ($1, 'henri_score_breakdown', $2, 'calculated', NOW())
  `, [propertyId, breakdown.explanation])

  // Save individual scores
  const scores = {
    score_snoring: breakdown.snoring_isolation,
    score_beach: breakdown.beach_access,
    score_rating: breakdown.rating_quality,
    score_adults: breakdown.adults_only,
    score_allinc: breakdown.all_inclusive,
    score_amenities: breakdown.amenities,
    score_reliability: breakdown.reliability,
  }

  for (const [key, value] of Object.entries(scores)) {
    await pool.query(`
      INSERT INTO property_metadata (property_id, key, value_numeric, source, created_at)
      VALUES ($1, $2, $3, 'calculated', NOW())
    `, [propertyId, key, value])
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  if (dryRun) {
    console.log('DRY RUN - no changes will be made\n')
  }

  // Get all vetted properties
  const result = await pool.query(`
    SELECT id, name, rating, review_count, is_adults_only, is_all_inclusive, has_twin_beds
    FROM properties
    WHERE status IN ('promising', 'reviewed')
    ORDER BY rating DESC NULLS LAST
  `)

  console.log(`Processing ${result.rows.length} vetted properties...\n`)
  console.log('Score | Tier       | Snoring | Beach | Rating | Adults | AI | Amen | Rev | Name')
  console.log('─'.repeat(120))

  const scored: Array<{ id: number; name: string; score: number; tier: string }> = []

  for (const row of result.rows) {
    const meta = await getPropertyMetadata(row.id)

    const prop: PropertyWithMeta = {
      ...row,
      meta,
    }

    const breakdown = calculateScore(prop)
    await saveScore(row.id, breakdown, dryRun)

    scored.push({ id: row.id, name: row.name, score: breakdown.total, tier: breakdown.tier })

    const scoreStr = String(breakdown.total).padStart(5)
    const tierStr = breakdown.tier.padEnd(10)
    const snoringStr = String(breakdown.snoring_isolation).padStart(7)
    const beachStr = String(breakdown.beach_access).padStart(5)
    const ratingStr = String(breakdown.rating_quality).padStart(6)
    const adultsStr = String(breakdown.adults_only).padStart(6)
    const aiStr = String(breakdown.all_inclusive).padStart(2)
    const amenStr = String(breakdown.amenities).padStart(4)
    const revStr = String(breakdown.reliability).padStart(3)
    const nameStr = row.name.slice(0, 45)

    console.log(`${scoreStr} | ${tierStr} | ${snoringStr} | ${beachStr} | ${ratingStr} | ${adultsStr} | ${aiStr} | ${amenStr} | ${revStr} | ${nameStr}`)
  }

  console.log('\n' + '─'.repeat(120))
  console.log('\nTop 10 by Henri Score:')
  scored.sort((a, b) => b.score - a.score)
  scored.slice(0, 10).forEach((p, i) => {
    console.log(`${i + 1}. [${p.score}] ${p.tier.padEnd(10)} - ${p.name}`)
  })

  if (!dryRun) {
    console.log('\n✅ Scores saved to property_metadata table')
  }

  await pool.end()
}

main().catch(console.error)
