import {
  pgTable,
  serial,
  varchar,
  date,
  integer,
  decimal,
  timestamp,
  boolean,
  text,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core'

// Destination configurations (ported from Python)
export const destinations = pgTable('destinations', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 3 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  region: varchar('region', { length: 50 }).notNull(),

  // Weather
  avgTempFeb: integer('avg_temp_feb').notNull(),
  sunshineHours: decimal('sunshine_hours', { precision: 3, scale: 1 }).notNull(),
  humidity: integer('humidity'),
  rainDays: integer('rain_days'),

  // Quality scores (1-10)
  beachQuality: integer('beach_quality').notNull(),
  culturalDepth: integer('cultural_depth').notNull(),
  foodScene: integer('food_scene').notNull(),
  safetyComfort: integer('safety_comfort').notNull(),

  // Costs (EUR)
  accommodationPerNight: decimal('accommodation_per_night', { precision: 8, scale: 2 }).notNull(),
  foodPerDay: decimal('food_per_day', { precision: 8, scale: 2 }).notNull(),
  dailyExpenses: decimal('daily_expenses', { precision: 8, scale: 2 }).notNull(),

  // Metadata
  uniqueActivities: jsonb('unique_activities'),
  pros: jsonb('pros'),
  cons: jsonb('cons'),
  notes: text('notes'),
  imageUrl: text('image_url'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Cached flight searches
export const flightSearches = pgTable('flight_searches', {
  id: serial('id').primaryKey(),
  searchKey: varchar('search_key', { length: 64 }).notNull().unique(),
  origin: varchar('origin', { length: 3 }).notNull(),
  destination: varchar('destination', { length: 3 }).notNull(),
  departureDate: date('departure_date').notNull(),
  adults: integer('adults').notNull().default(2),
  cabinClass: varchar('cabin_class', { length: 20 }).notNull().default('economy'),

  // Result
  found: boolean('found').notNull().default(false),
  price: decimal('price', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }),
  airline: varchar('airline', { length: 100 }),
  stops: integer('stops'),
  duration: varchar('duration', { length: 20 }),
  offerId: varchar('offer_id', { length: 100 }),

  // Metadata
  source: varchar('source', { length: 32 }).notNull().default('duffel'),
  tokenType: varchar('token_type', { length: 10 }).notNull(),
  searchedAt: timestamp('searched_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
})

// Trip combinations (round-trips)
export const tripCombinations = pgTable('trip_combinations', {
  id: serial('id').primaryKey(),
  destination: varchar('destination', { length: 3 }).notNull(),
  destinationName: varchar('destination_name', { length: 100 }).notNull(),
  source: varchar('source', { length: 32 }).notNull().default('duffel'),

  // Outbound
  outboundDate: date('outbound_date').notNull(),
  outboundPrice: decimal('outbound_price', { precision: 10, scale: 2 }).notNull(),
  outboundAirline: varchar('outbound_airline', { length: 100 }),
  outboundStops: integer('outbound_stops'),
  outboundDuration: varchar('outbound_duration', { length: 20 }),

  // Return
  returnDate: date('return_date').notNull(),
  returnPrice: decimal('return_price', { precision: 10, scale: 2 }).notNull(),
  returnAirline: varchar('return_airline', { length: 100 }),
  returnStops: integer('return_stops'),
  returnDuration: varchar('return_duration', { length: 20 }),

  // Summary
  tripDays: integer('trip_days').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),

  // Scoring
  experientialValue: numeric('experiential_value', { precision: 12, scale: 2 }),
  totalCost: numeric('total_cost', { precision: 12, scale: 2 }),
  finalValue: numeric('final_value', { precision: 12, scale: 2 }),
  roi: numeric('roi', { precision: 8, scale: 2 }),

  // Metadata
  tokenType: varchar('token_type', { length: 10 }).notNull(),
  isCheapest: boolean('is_cheapest').default(false),
  isFastest: boolean('is_fastest').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Export types
export type Destination = typeof destinations.$inferSelect
export type NewDestination = typeof destinations.$inferInsert
export type FlightSearch = typeof flightSearches.$inferSelect
export type TripCombination = typeof tripCombinations.$inferSelect
