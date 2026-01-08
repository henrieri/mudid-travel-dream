// Types
export type {
  Activity,
  Destination,
  FlightLeg,
  Trip,
  ExperientialBreakdown,
  CostBreakdown,
  TripEvaluation,
  TravelerProfile,
  ExperienceWeights,
  ScoringConfig,
} from './types'

// Configuration
export {
  DEFAULT_PROFILE,
  DEFAULT_WEIGHTS,
  DEFAULT_CONFIG,
  SEARCH_CONFIG,
} from './config'

// Value calculations
export {
  calculateWinterEscapeValue,
  calculateBeachValue,
  calculateCulturalValue,
  calculateFoodValue,
  calculateActivitiesValue,
  calculateSafetyValue,
  calculateExperientialValue,
} from './value'

// Cost calculations
export {
  calculateRiskPenalty,
  calculateDurationPenalty,
  calculateLongStayPenalty,
  calculateCosts,
} from './costs'

// Trip evaluation
export {
  evaluateTrip,
  rankTrips,
  selectTopTrips,
} from './evaluate'

// Destinations
export {
  DESTINATIONS,
  getDestination,
  getDestinationCodes,
  getDestinationsSortedBy,
} from './destinations'

// Permutations & utilities
export type { DatePermutation } from './permutations'
export {
  generatePermutations,
  getPermutationCount,
  parseDurationHours,
  formatDuration,
  generateOfferId,
} from './permutations'
