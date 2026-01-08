import type { Trip, CostBreakdown, ScoringConfig } from './types'
import { DEFAULT_CONFIG } from './config'

/**
 * Calculate risk penalty based on safety rating
 * Lower safety = higher penalty
 */
export function calculateRiskPenalty(
  safetyRating: number,
  tripDays: number,
  config: ScoringConfig = DEFAULT_CONFIG
): number {
  const unsafePoints = Math.max(0, 10 - safetyRating)
  return (unsafePoints / 10) * config.penalties.riskCostPerDay * tripDays
}

/**
 * Calculate flight duration penalty
 * Base penalty for all hours, extra penalty for very long flights
 */
export function calculateDurationPenalty(
  outboundHours: number,
  returnHours: number,
  config: ScoringConfig = DEFAULT_CONFIG
): number {
  const { durationBasePenaltyPerHour, durationThresholdHours, durationPenaltyPerHour } =
    config.penalties

  // Base penalty for all hours
  const totalHours = outboundHours + returnHours
  let penalty = totalHours * durationBasePenaltyPerHour

  // Extra penalty for legs exceeding threshold
  const outboundExcess = Math.max(0, outboundHours - durationThresholdHours)
  const returnExcess = Math.max(0, returnHours - durationThresholdHours)
  penalty += (outboundExcess + returnExcess) * durationPenaltyPerHour

  return penalty
}

/**
 * Calculate long stay penalty for trips exceeding threshold
 */
export function calculateLongStayPenalty(
  tripDays: number,
  config: ScoringConfig = DEFAULT_CONFIG
): number {
  const { longStayThresholdDays, longStayPenaltyPerDay } = config.penalties
  const excessDays = Math.max(0, tripDays - longStayThresholdDays)
  return excessDays * longStayPenaltyPerDay
}

/**
 * Calculate complete cost breakdown for a trip
 */
export function calculateCosts(
  trip: Trip,
  config: ScoringConfig = DEFAULT_CONFIG
): CostBreakdown {
  const { destination, tripDays, totalFlightPrice, outbound, return: returnFlight } = trip
  const { adults } = config.profile

  // Accommodation (per night, for all travelers)
  const accommodation = destination.accommodationCostPerNight * tripDays

  // Food (per day, for all travelers)
  const food = destination.foodCostPerDay * tripDays * adults

  // Daily expenses (per day, for all travelers)
  const dailyExpenses = destination.dailyExpenses * tripDays * adults

  // Risk penalty
  const riskPenalty = calculateRiskPenalty(
    destination.safetyComfort,
    tripDays,
    config
  )

  // Duration penalty
  const durationPenalty = calculateDurationPenalty(
    outbound.durationHours,
    returnFlight.durationHours,
    config
  )

  // Long stay penalty
  const longStayPenalty = calculateLongStayPenalty(tripDays, config)

  // Total cost
  const total =
    totalFlightPrice +
    accommodation +
    food +
    dailyExpenses +
    riskPenalty +
    durationPenalty +
    longStayPenalty

  return {
    flights: totalFlightPrice,
    accommodation,
    food,
    dailyExpenses,
    riskPenalty,
    durationPenalty,
    longStayPenalty,
    total,
  }
}
