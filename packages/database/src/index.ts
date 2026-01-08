import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432'),
  database: process.env.DB_NAME ?? 'travel_dream',
  user: process.env.DB_USER ?? 'travel',
  password: process.env.DB_PASSWORD ?? 'travel123',
})

export const db = drizzle(pool, { schema })

export * from './schema'
