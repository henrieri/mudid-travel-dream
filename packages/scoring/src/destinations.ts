import type { Destination } from './types'

/**
 * Destination configurations for February 2026 trip planning
 * Based on Henri & Evelina's preferences
 */
export const DESTINATIONS: Record<string, Destination> = {
  HKT: {
    code: 'HKT',
    name: 'Phuket',
    country: 'Thailand',
    region: 'Southeast Asia',
    avgTempFeb: 31,
    sunshineHours: 9,
    humidity: 70,
    rainDays: 3,
    beachQuality: 9,
    culturalDepth: 6,
    culturalDays: 4,
    foodScene: 8,
    foodCostPerDay: 25,
    accommodationCostPerNight: 80,
    accommodationQuality: 8,
    dailyExpenses: 30,
    safetyComfort: 8,
    uniqueActivities: [
      { name: 'Island hopping Phi Phi', baseValue: 80, quality: 9 },
      { name: 'Thai cooking class', baseValue: 50, quality: 8 },
      { name: 'Elephant sanctuary visit', baseValue: 70, quality: 8 },
    ],
    estimatedGroundCost14Days: 1400,
    pros: ['Amazing beaches', 'Affordable', 'Great food', 'Good infrastructure'],
    cons: ['Touristy', 'Long flight'],
    imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400',
  },

  BKK: {
    code: 'BKK',
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Southeast Asia',
    avgTempFeb: 32,
    sunshineHours: 9,
    humidity: 65,
    rainDays: 1,
    beachQuality: 4, // City, no direct beach
    culturalDepth: 9,
    culturalDays: 7,
    foodScene: 10,
    foodCostPerDay: 20,
    accommodationCostPerNight: 60,
    accommodationQuality: 8,
    dailyExpenses: 25,
    safetyComfort: 7,
    uniqueActivities: [
      { name: 'Grand Palace & Wat Phra Kaew', baseValue: 60, quality: 9 },
      { name: 'Floating markets', baseValue: 50, quality: 8 },
      { name: 'Street food tour', baseValue: 40, quality: 10 },
      { name: 'Muay Thai experience', baseValue: 45, quality: 7 },
    ],
    estimatedGroundCost14Days: 1200,
    pros: ['Amazing food', 'Rich culture', 'Very affordable', 'Good flights'],
    cons: ['No beach', 'Hot and humid', 'Chaotic traffic'],
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400',
  },

  CMB: {
    code: 'CMB',
    name: 'Colombo',
    country: 'Sri Lanka',
    region: 'South Asia',
    avgTempFeb: 28,
    sunshineHours: 8,
    humidity: 75,
    rainDays: 5,
    beachQuality: 8,
    culturalDepth: 8,
    culturalDays: 6,
    foodScene: 7,
    foodCostPerDay: 25,
    accommodationCostPerNight: 70,
    accommodationQuality: 7,
    dailyExpenses: 35,
    safetyComfort: 6,
    uniqueActivities: [
      { name: 'Sigiriya Rock Fortress', baseValue: 80, quality: 9 },
      { name: 'Train to Ella', baseValue: 60, quality: 10 },
      { name: 'Whale watching Mirissa', baseValue: 70, quality: 8 },
      { name: 'Tea plantation visit', baseValue: 40, quality: 7 },
    ],
    estimatedGroundCost14Days: 1400,
    pros: ['Diverse experiences', 'Beautiful nature', 'Unique culture'],
    cons: ['Infrastructure challenges', 'Economic instability'],
    imageUrl: 'https://images.unsplash.com/photo-1743592322118-3d38461f7187?w=400',
  },

  ZNZ: {
    code: 'ZNZ',
    name: 'Zanzibar',
    country: 'Tanzania',
    region: 'East Africa',
    avgTempFeb: 30,
    sunshineHours: 8,
    humidity: 80,
    rainDays: 5,
    beachQuality: 9,
    culturalDepth: 8,
    culturalDays: 5,
    foodScene: 7,
    foodCostPerDay: 35,
    accommodationCostPerNight: 75,
    accommodationQuality: 7,
    dailyExpenses: 40,
    safetyComfort: 6,
    uniqueActivities: [
      { name: 'Stone Town UNESCO walking tour', baseValue: 70, quality: 9 },
      { name: 'Spice farm tour', baseValue: 50, quality: 8 },
      { name: 'Snorkeling Mnemba Atoll', baseValue: 80, quality: 9 },
      { name: 'Jozani Forest (Red Colobus)', baseValue: 45, quality: 7 },
    ],
    estimatedGroundCost14Days: 1600,
    pros: ['Stunning beaches', 'Unique Swahili culture', 'Great diving'],
    cons: ['Remote', 'Some infrastructure issues', 'Humid'],
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400',
  },

  DPS: {
    code: 'DPS',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    avgTempFeb: 27,
    sunshineHours: 7,
    humidity: 85,
    rainDays: 8, // Wet season
    beachQuality: 8,
    culturalDepth: 9,
    culturalDays: 7,
    foodScene: 8,
    foodCostPerDay: 30,
    accommodationCostPerNight: 90,
    accommodationQuality: 8,
    dailyExpenses: 35,
    safetyComfort: 8,
    uniqueActivities: [
      { name: 'Ubud rice terraces', baseValue: 50, quality: 9 },
      { name: 'Temple hopping', baseValue: 60, quality: 8 },
      { name: 'Sunrise trek Mt Batur', baseValue: 70, quality: 8 },
      { name: 'Balinese cooking class', baseValue: 45, quality: 8 },
    ],
    estimatedGroundCost14Days: 1800,
    pros: ['Beautiful temples', 'Great food', 'Yoga/wellness', 'Good infrastructure'],
    cons: ['Rainy in Feb', 'Touristy', 'Traffic in south'],
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
  },

  MLE: {
    code: 'MLE',
    name: 'Maldives',
    country: 'Maldives',
    region: 'South Asia',
    avgTempFeb: 29,
    sunshineHours: 9,
    humidity: 75,
    rainDays: 2,
    beachQuality: 10,
    culturalDepth: 3,
    culturalDays: 2,
    foodScene: 6,
    foodCostPerDay: 100, // Resort pricing
    accommodationCostPerNight: 200,
    accommodationQuality: 9,
    dailyExpenses: 50,
    safetyComfort: 9,
    uniqueActivities: [
      { name: 'Snorkeling house reef', baseValue: 60, quality: 10 },
      { name: 'Sunset dolphin cruise', baseValue: 80, quality: 9 },
      { name: 'Underwater restaurant', baseValue: 120, quality: 8 },
    ],
    estimatedGroundCost14Days: 3500,
    pros: ['Perfect beaches', 'Crystal clear water', 'Luxury experience', 'Safe'],
    cons: ['Extremely expensive', 'Limited activities', 'No culture'],
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400',
  },

  PNH: {
    code: 'PNH',
    name: 'Phnom Penh',
    country: 'Cambodia',
    region: 'Southeast Asia',
    avgTempFeb: 30,
    sunshineHours: 9,
    humidity: 60,
    rainDays: 1,
    beachQuality: 3, // Riverside city
    culturalDepth: 9,
    culturalDays: 5,
    foodScene: 8,
    foodCostPerDay: 20,
    accommodationCostPerNight: 45,
    accommodationQuality: 7,
    dailyExpenses: 25,
    safetyComfort: 6,
    uniqueActivities: [
      { name: 'Angkor Wat (Siem Reap combo)', baseValue: 100, quality: 10 },
      { name: 'Royal Palace tour', baseValue: 50, quality: 8 },
      { name: 'Killing Fields memorial', baseValue: 40, quality: 9 },
      { name: 'Mekong boat cruise', baseValue: 35, quality: 7 },
    ],
    estimatedGroundCost14Days: 1100,
    pros: ['Very affordable', 'Angkor Wat access', 'Rich history', 'Great food'],
    cons: ['No beaches', 'Hot', 'Some scams'],
    imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400',
  },

  KUL: {
    code: 'KUL',
    name: 'Kuala Lumpur',
    country: 'Malaysia',
    region: 'Southeast Asia',
    avgTempFeb: 31,
    sunshineHours: 7,
    humidity: 80,
    rainDays: 9,
    beachQuality: 5, // City, beaches nearby
    culturalDepth: 7,
    culturalDays: 4,
    foodScene: 9,
    foodCostPerDay: 25,
    accommodationCostPerNight: 55,
    accommodationQuality: 8,
    dailyExpenses: 30,
    safetyComfort: 8,
    uniqueActivities: [
      { name: 'Petronas Towers', baseValue: 50, quality: 8 },
      { name: 'Batu Caves', baseValue: 40, quality: 7 },
      { name: 'Street food tour', baseValue: 35, quality: 9 },
      { name: 'Day trip Langkawi', baseValue: 80, quality: 8 },
    ],
    estimatedGroundCost14Days: 1300,
    pros: ['Amazing food', 'Modern city', 'Affordable', 'Good hub'],
    cons: ['Rainy', 'City destination', 'Not beach focused'],
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400',
  },

  GOI: {
    code: 'GOI',
    name: 'Goa',
    country: 'India',
    region: 'South Asia',
    avgTempFeb: 31,
    sunshineHours: 10,
    humidity: 60,
    rainDays: 0,
    beachQuality: 7,
    culturalDepth: 6,
    culturalDays: 4,
    foodScene: 8,
    foodCostPerDay: 20,
    accommodationCostPerNight: 50,
    accommodationQuality: 7,
    dailyExpenses: 25,
    safetyComfort: 6,
    uniqueActivities: [
      { name: 'Portuguese heritage tour', baseValue: 45, quality: 7 },
      { name: 'Spice plantation visit', baseValue: 35, quality: 7 },
      { name: 'Beach hopping', baseValue: 40, quality: 8 },
      { name: 'Seafood feast', baseValue: 30, quality: 9 },
    ],
    estimatedGroundCost14Days: 1100,
    pros: ['Very affordable', 'Good beaches', 'Great food', 'Laid-back vibe'],
    cons: ['India travel challenges', 'Crowded beaches'],
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
  },

  MRU: {
    code: 'MRU',
    name: 'Mauritius',
    country: 'Mauritius',
    region: 'Indian Ocean',
    avgTempFeb: 27,
    sunshineHours: 8,
    humidity: 80,
    rainDays: 10, // Cyclone season
    beachQuality: 9,
    culturalDepth: 5,
    culturalDays: 3,
    foodScene: 7,
    foodCostPerDay: 50,
    accommodationCostPerNight: 120,
    accommodationQuality: 8,
    dailyExpenses: 45,
    safetyComfort: 8,
    uniqueActivities: [
      { name: 'Chamarel Seven Colored Earth', baseValue: 50, quality: 8 },
      { name: 'Catamaran cruise Ile aux Cerfs', baseValue: 80, quality: 9 },
      { name: 'Black River Gorges hike', baseValue: 45, quality: 7 },
    ],
    estimatedGroundCost14Days: 2400,
    pros: ['Beautiful beaches', 'Safe', 'Good infrastructure'],
    cons: ['Expensive', 'Cyclone season Feb', 'Resort-focused'],
    imageUrl: 'https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=400',
  },
}

/**
 * Get destination by IATA code
 */
export function getDestination(code: string): Destination | undefined {
  return DESTINATIONS[code.toUpperCase()]
}

/**
 * Get all destination codes
 */
export function getDestinationCodes(): string[] {
  return Object.keys(DESTINATIONS)
}

/**
 * Get all destinations sorted by a criteria
 */
export function getDestinationsSortedBy(
  criteria: 'beachQuality' | 'avgTempFeb' | 'foodScene' | 'safetyComfort' | 'estimatedGroundCost14Days'
): Destination[] {
  return Object.values(DESTINATIONS).sort((a, b) => {
    const aVal = a[criteria] ?? 0
    const bVal = b[criteria] ?? 0
    return bVal - aVal // Descending
  })
}
