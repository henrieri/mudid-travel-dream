import type { Trip, TripEvaluation, ScoringConfig } from './types'
import { DEFAULT_CONFIG } from './config'
import { calculateExperientialValue } from './value'
import { calculateCosts } from './costs'

/**
 * Determine recommendation based on ROI and income percentage
 */
function getRecommendation(
  roi: number,
  incomePercent: number
): TripEvaluation['recommendation'] {
  if (incomePercent > 50) {
    return 'expensive'
  }
  if (roi > 80 && incomePercent < 30) {
    return 'exceptional'
  }
  if (roi > 60 && incomePercent < 40) {
    return 'great'
  }
  if (roi > 40) {
    return 'good'
  }
  return 'mediocre'
}

/**
 * Evaluate a complete trip with full scoring
 */
export function evaluateTrip(
  trip: Trip,
  config: ScoringConfig = DEFAULT_CONFIG
): TripEvaluation {
  const { destination, tripDays } = trip

  // Calculate experiential value
  const experiential = calculateExperientialValue(destination, tripDays, config)

  // Calculate costs
  const costs = calculateCosts(trip, config)

  // Final value (experiential - costs)
  const finalValue = experiential.adjusted - costs.total

  // ROI percentage
  const roi = costs.total > 0 ? (experiential.adjusted / costs.total) * 100 : 0

  // Income percentage
  const incomePercent =
    (costs.total / config.profile.monthlyNetIncome) * 100

  // Recommendation
  const recommendation = getRecommendation(roi, incomePercent)

  return {
    trip,
    experiential,
    costs,
    finalValue,
    roi,
    incomePercent,
    recommendation,
  }
}

/**
 * Compare and rank multiple trips
 */
export function rankTrips(
  trips: Trip[],
  config: ScoringConfig = DEFAULT_CONFIG
): TripEvaluation[] {
  return trips
    .map((trip) => evaluateTrip(trip, config))
    .sort((a, b) => b.finalValue - a.finalValue)
}

/**
 * Get top N trips by different criteria
 */
export function selectTopTrips(
  evaluations: TripEvaluation[],
  limit: number = 5
): {
  cheapest: TripEvaluation | null
  fastest: TripEvaluation | null
  bestValue: TripEvaluation[]
} {
  if (evaluations.length === 0) {
    return { cheapest: null, fastest: null, bestValue: [] }
  }

  // Find cheapest
  const cheapest = [...evaluations].sort(
    (a, b) => a.costs.total - b.costs.total
  )[0]

  // Find fastest (by total flight hours)
  const fastest = [...evaluations].sort((a, b) => {
    const aHours =
      a.trip.outbound.durationHours + a.trip.return.durationHours
    const bHours =
      b.trip.outbound.durationHours + b.trip.return.durationHours
    return aHours - bHours
  })[0]

  // Track seen offer IDs to prevent duplicates
  const seen = new Set<string>()
  const bestValue: TripEvaluation[] = []

  // Add cheapest first (if has offerId)
  if (cheapest.trip.offerId) {
    seen.add(cheapest.trip.offerId)
  }

  // Add fastest if different from cheapest
  if (
    fastest.trip.offerId &&
    fastest.trip.offerId !== cheapest.trip.offerId
  ) {
    seen.add(fastest.trip.offerId)
  }

  // Add top value-ranked that aren't already selected
  const sorted = [...evaluations].sort((a, b) => b.finalValue - a.finalValue)

  for (const evaluation of sorted) {
    if (bestValue.length >= limit - 2) break // Reserve 2 slots for cheapest/fastest

    if (evaluation.trip.offerId) {
      if (!seen.has(evaluation.trip.offerId)) {
        bestValue.push(evaluation)
        seen.add(evaluation.trip.offerId)
      }
    } else {
      bestValue.push(evaluation)
    }
  }

  return { cheapest, fastest, bestValue }
}
