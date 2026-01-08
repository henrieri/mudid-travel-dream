import type { Destination, ScoringConfig, Activity } from './types'
import { DEFAULT_CONFIG } from './config'

/**
 * Calculate winter escape value based on temperature and sunshine improvement
 * Compares destination weather vs Estonian February baseline
 */
export function calculateWinterEscapeValue(
  destination: Destination,
  tripDays: number,
  config: ScoringConfig = DEFAULT_CONFIG
): number {
  const { tallinnTempFeb, tallinnSunshineHours } = config.baselines

  // Temperature improvement value (capped at 100/day)
  const tempImprovement = destination.avgTempFeb - tallinnTempFeb
  const tempValuePerDay = Math.min(tempImprovement * 3, 100)

  // Sunshine improvement value (capped at 80/day)
  const sunshineImprovement = destination.sunshineHours - tallinnSunshineHours
  const sunshineValuePerDay = Math.min(sunshineImprovement * 10, 80)

  const dailyValue = tempValuePerDay + sunshineValuePerDay

  // Diminishing returns after 10 days (habituation)
  const fullValueDays = Math.min(tripDays, 10)
  const diminishedDays = Math.max(0, tripDays - 10)

  return fullValueDays * dailyValue + diminishedDays * dailyValue * 0.6
}

/**
 * Calculate beach value with quality-based diminishing returns
 */
export function calculateBeachValue(
  destination: Destination,
  tripDays: number
): number {
  const qualityMultiplier = destination.beachQuality / 10
  const baseValuePerDay = 90 * qualityMultiplier

  // Available beach days (some destinations have limited access)
  const beachDays = Math.min(tripDays, destination.beachDays ?? tripDays)

  // Diminishing returns by phase
  // Days 1-3: 100% (novel, exciting)
  // Days 4-7: 85% (still enjoying)
  // Days 8+: 50% (routine)
  let value = 0

  const phase1Days = Math.min(beachDays, 3)
  value += phase1Days * baseValuePerDay * 1.0

  const phase2Days = Math.min(Math.max(0, beachDays - 3), 4)
  value += phase2Days * baseValuePerDay * 0.85

  const phase3Days = Math.max(0, beachDays - 7)
  value += phase3Days * baseValuePerDay * 0.5

  return value
}

/**
 * Calculate cultural value with optimal range logic
 * Sweet spot is 5-7 days
 */
export function calculateCulturalValue(
  destination: Destination,
  tripDays: number
): number {
  const qualityMultiplier = destination.culturalDepth / 10
  const baseValuePerDay = 50 * qualityMultiplier

  // Cultural days available at destination
  const culturalDays = destination.culturalDays ?? 7

  // Actual days we can spend on culture
  const actualCulturalDays = Math.min(tripDays, culturalDays)

  // Optimal range logic
  if (actualCulturalDays < 5) {
    // Rushed - reduced efficiency
    const efficiency = actualCulturalDays / 5
    return actualCulturalDays * baseValuePerDay * efficiency
  } else if (actualCulturalDays <= 7) {
    // Optimal depth - full value
    return actualCulturalDays * baseValuePerDay
  } else {
    // Diminishing returns for excess days
    const optimalValue = 7 * baseValuePerDay
    const excessDays = actualCulturalDays - 7
    return optimalValue + excessDays * baseValuePerDay * 0.5
  }
}

/**
 * Calculate food value comparing cost and quality vs Tallinn baseline
 */
export function calculateFoodValue(
  destination: Destination,
  tripDays: number,
  config: ScoringConfig = DEFAULT_CONFIG
): number {
  const qualityMultiplier = destination.foodScene / 10
  const experiencePremium = 30 * qualityMultiplier

  const costDiff =
    destination.foodCostPerDay - config.baselines.tallinnFoodCostPerDay

  if (costDiff < 0) {
    // Cheaper than Tallinn - savings + experience value
    const savingsValue = Math.abs(costDiff) * tripDays
    const experienceValue = experiencePremium * 0.9 * tripDays
    return savingsValue + experienceValue
  } else {
    // More expensive - experience value minus extra cost penalty
    const experienceValue = experiencePremium * tripDays
    const extraCostPenalty = costDiff * tripDays * 0.5
    return experienceValue - extraCostPenalty
  }
}

/**
 * Calculate activity value (one-time per unique activity)
 */
export function calculateActivitiesValue(
  destination: Destination,
  tripDays: number
): number {
  const activities = destination.uniqueActivities

  // Sum up individual activity values
  const baseValue = activities.reduce((sum: number, activity: Activity) => {
    return sum + activity.baseValue * (activity.quality / 10)
  }, 0)

  // Pacing bonus if we have enough days for all activities
  if (tripDays >= activities.length) {
    return baseValue * 1.2 // 20% pacing bonus
  }

  return baseValue
}

/**
 * Calculate safety/comfort value
 * Higher safety = reduced travel stress/anxiety
 */
export function calculateSafetyValue(
  destination: Destination,
  tripDays: number
): number {
  const safetyValuePerDay = (destination.safetyComfort / 10) * 20
  return safetyValuePerDay * tripDays
}

/**
 * Calculate total experiential value with all components
 */
export function calculateExperientialValue(
  destination: Destination,
  tripDays: number,
  config: ScoringConfig = DEFAULT_CONFIG
): {
  winterEscape: number
  beach: number
  cultural: number
  food: number
  activities: number
  safety: number
  raw: number
  adjusted: number
} {
  const { weights, multipliers } = config

  // Calculate each component
  const winterEscape = calculateWinterEscapeValue(destination, tripDays, config)
  const beach = calculateBeachValue(destination, tripDays)
  const cultural = calculateCulturalValue(destination, tripDays)
  const food = calculateFoodValue(destination, tripDays, config)
  const activities = calculateActivitiesValue(destination, tripDays)
  const safety = calculateSafetyValue(destination, tripDays)

  // Apply weights
  const weightedSum =
    winterEscape * weights.winterEscape +
    beach * weights.beach +
    cultural * weights.cultural +
    food * weights.food +
    activities * weights.activities +
    safety * weights.safety

  // Raw value before multipliers
  const raw = weightedSum

  // Apply global multipliers
  let adjusted = raw * multipliers.experientialValue

  // Couple multiplier (value shared)
  if (multipliers.coupleMultiplier) {
    adjusted *= config.profile.adults
  }

  // Seasonal winter boost for February
  adjusted *= multipliers.seasonalWinterBoost

  // Beach/swim boost for beach-focused destinations
  if (destination.beachQuality >= 7) {
    adjusted *= multipliers.beachSwimBoost
  }

  return {
    winterEscape,
    beach,
    cultural,
    food,
    activities,
    safety,
    raw,
    adjusted,
  }
}
