import { SEARCH_CONFIG } from './config'

/**
 * Date permutation for trip search
 */
export interface DatePermutation {
  outboundDate: string // ISO date YYYY-MM-DD
  returnDate: string // ISO date YYYY-MM-DD
  tripDays: number
}

/**
 * Add days to a date string
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

/**
 * Get all dates between start and end (inclusive)
 */
function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  let current = startDate

  while (current <= endDate) {
    dates.push(current)
    current = addDays(current, 1)
  }

  return dates
}

/**
 * Generate all trip date permutations for the search window
 */
export function generatePermutations(
  config = SEARCH_CONFIG
): DatePermutation[] {
  const { outboundStartDate, outboundEndDate, minTripDays, maxTripDays } = config
  const permutations: DatePermutation[] = []

  // Get all outbound dates
  const outboundDates = getDateRange(outboundStartDate, outboundEndDate)

  // For each outbound date, generate all trip length options
  for (const outboundDate of outboundDates) {
    for (let tripDays = minTripDays; tripDays <= maxTripDays; tripDays++) {
      const returnDate = addDays(outboundDate, tripDays)

      permutations.push({
        outboundDate,
        returnDate,
        tripDays,
      })
    }
  }

  return permutations
}

/**
 * Get permutation count for a destination
 */
export function getPermutationCount(config = SEARCH_CONFIG): number {
  const { outboundStartDate, outboundEndDate, minTripDays, maxTripDays } = config
  const outboundDates = getDateRange(outboundStartDate, outboundEndDate)
  const tripLengthOptions = maxTripDays - minTripDays + 1

  return outboundDates.length * tripLengthOptions
}

/**
 * Parse duration string to hours
 * Handles:
 * - Numeric seconds: 45300 -> 12.58
 * - ISO-8601: PT13H45M -> 13.75
 * - ISO with days: P1DT2H30M -> 26.5
 */
export function parseDurationHours(duration: string | number): number {
  if (typeof duration === 'number') {
    // Assume seconds
    return duration / 3600
  }

  // ISO-8601 format
  const match = duration.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/)
  if (match) {
    const days = parseInt(match[1] || '0', 10)
    const hours = parseInt(match[2] || '0', 10)
    const minutes = parseInt(match[3] || '0', 10)

    return days * 24 + hours + minutes / 60
  }

  // Try parsing as seconds
  const seconds = parseFloat(duration)
  if (!isNaN(seconds)) {
    return seconds / 3600
  }

  return 0
}

/**
 * Format hours to human-readable duration
 */
export function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)

  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Generate a unique offer ID from flight data
 */
export function generateOfferId(data: string): string {
  // Simple hash for deduplication
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}
