import type { ScoringConfig, TravelerProfile, ExperienceWeights } from './types'

/**
 * Default traveler profile for Henri & Evelina
 */
export const DEFAULT_PROFILE: TravelerProfile = {
  // Henri ~6.2k + Evelina ~2k + RSU/bonus ~2.8k
  monthlyNetIncome: 11000,
  annualNetIncome: 132000,
  discretionaryPercent: 0.3, // 30% for travel
  vacationDaysPerYear: 28,
  adults: 2,
}

/**
 * Experience weight distribution (must sum to 1.0)
 * Reflects Henri & Evelina's priorities
 */
export const DEFAULT_WEIGHTS: ExperienceWeights = {
  winterEscape: 0.3, // Top priority - escaping Estonian winter
  beach: 0.35, // Beaches & swimming emphasized
  cultural: 0.1, // Experiences, history, culture
  food: 0.1, // Culinary experiences
  activities: 0.08, // Special experiences
  safety: 0.07, // Ease of travel, safety
}

/**
 * Default scoring configuration
 */
export const DEFAULT_CONFIG: ScoringConfig = {
  profile: DEFAULT_PROFILE,
  weights: DEFAULT_WEIGHTS,
  multipliers: {
    experientialValue: 2.0, // Base calibration knob
    coupleMultiplier: true, // Value shared between couple
    seasonalWinterBoost: 1.15, // +15% for February trips
    beachSwimBoost: 1.5, // +50% emphasis on beach/swimming
  },
  penalties: {
    riskCostPerDay: 10, // Per unsafe point below 10
    durationBasePenaltyPerHour: 20, // All flight hours
    durationThresholdHours: 24, // Extra penalty beyond this per leg
    durationPenaltyPerHour: 100, // Beyond threshold
    longStayPenaltyPerDay: 200, // For days > 14
    longStayThresholdDays: 14,
  },
  baselines: {
    tallinnTempFeb: 0, // Celsius in February
    tallinnSunshineHours: 2.5, // Hours/day in February
    tallinnFoodCostPerDay: 40, // EUR
  },
}

/**
 * Permutation search configuration
 */
export const SEARCH_CONFIG = {
  outboundStartDate: '2026-02-06',
  outboundEndDate: '2026-02-28',
  minTripDays: 10,
  maxTripDays: 20,
  origin: 'TLL', // Tallinn
  cabinClass: 'economy' as const,
  maxConnections: 2,
}
