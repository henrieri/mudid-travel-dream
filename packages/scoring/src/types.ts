/**
 * Activity available at a destination
 */
export interface Activity {
  name: string
  baseValue: number // EUR
  quality: number // 1-10
}

/**
 * Destination configuration with all scoring factors
 */
export interface Destination {
  code: string // IATA code
  name: string
  country: string
  region: string

  // Climate (February baseline)
  avgTempFeb: number // Celsius
  sunshineHours: number // hours/day
  humidity?: number // %
  rainDays?: number

  // Beach (1-10 scale)
  beachQuality: number
  beachDays?: number // Default unlimited

  // Culture (1-10 scale)
  culturalDepth: number
  culturalDays?: number // Optimal days for culture

  // Food (1-10 scale, cost in EUR)
  foodScene: number
  foodCostPerDay: number

  // Accommodation
  accommodationCostPerNight: number
  accommodationQuality?: number // 1-10

  // Daily expenses (EUR - transport, activities, etc.)
  dailyExpenses: number

  // Safety/comfort (1-10 scale)
  safetyComfort: number

  // Unique activities
  uniqueActivities: Activity[]

  // Metadata
  notes?: string
  estimatedGroundCost14Days?: number
  pros?: string[]
  cons?: string[]
  imageUrl?: string
}

/**
 * Flight leg information
 */
export interface FlightLeg {
  date: string // ISO date YYYY-MM-DD
  price: number // EUR
  airline?: string
  stops: number
  durationHours: number
}

/**
 * Complete trip with flights and destination
 */
export interface Trip {
  destination: Destination
  outbound: FlightLeg
  return: FlightLeg
  tripDays: number
  totalFlightPrice: number
  currency: string
  offerId?: string
}

/**
 * Breakdown of experiential value by component
 */
export interface ExperientialBreakdown {
  winterEscape: number
  beach: number
  cultural: number
  food: number
  activities: number
  safety: number
  raw: number // Before multipliers
  adjusted: number // After multipliers
}

/**
 * Breakdown of costs
 */
export interface CostBreakdown {
  flights: number
  accommodation: number
  food: number
  dailyExpenses: number
  riskPenalty: number
  durationPenalty: number
  longStayPenalty: number
  total: number
}

/**
 * Complete trip evaluation result
 */
export interface TripEvaluation {
  trip: Trip
  experiential: ExperientialBreakdown
  costs: CostBreakdown
  finalValue: number // experiential.adjusted - costs.total
  roi: number // (experiential.adjusted / costs.total) * 100
  incomePercent: number // (costs.total / monthlyIncome) * 100
  recommendation: 'exceptional' | 'great' | 'good' | 'mediocre' | 'expensive'
}

/**
 * Traveler profile for scoring calibration
 */
export interface TravelerProfile {
  monthlyNetIncome: number
  annualNetIncome: number
  discretionaryPercent: number
  vacationDaysPerYear: number
  adults: number
}

/**
 * Experience weight distribution (must sum to 1.0)
 */
export interface ExperienceWeights {
  winterEscape: number
  beach: number
  cultural: number
  food: number
  activities: number
  safety: number
}

/**
 * Scoring configuration
 */
export interface ScoringConfig {
  profile: TravelerProfile
  weights: ExperienceWeights
  multipliers: {
    experientialValue: number
    coupleMultiplier: boolean
    seasonalWinterBoost: number
    beachSwimBoost: number
  }
  penalties: {
    riskCostPerDay: number
    durationBasePenaltyPerHour: number
    durationThresholdHours: number
    durationPenaltyPerHour: number
    longStayPenaltyPerDay: number
    longStayThresholdDays: number
  }
  baselines: {
    tallinnTempFeb: number
    tallinnSunshineHours: number
    tallinnFoodCostPerDay: number
  }
}
