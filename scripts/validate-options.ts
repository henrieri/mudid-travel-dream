#!/usr/bin/env npx tsx
/**
 * Validates all option JSON files against Zod schema and exports to CSV
 * Usage: npx ts-node scripts/validate-options.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zod schema matching docs/options/schema.json
const OptionSchema = z.object({
  id: z.string().describe('Unique identifier (e.g., option-001)'),
  type: z.enum(['hotel', 'hotel-2-rooms', 'apartment', 'villa', 'suite', 'resort', 'resort-suite', 'airbnb']),
  name: z.string(),
  provider: z.enum(['booking.com', 'airbnb', 'expedia', 'direct']),
  url: z.string().url(),
  dates: z.object({
    checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    nights: z.number().int().positive()
  }),
  pricing: z.object({
    total: z.number().nullable(),
    currency: z.string(),
    perNight: z.number().nullable().optional(),
    perRoom: z.number().nullable().optional(),
    rooms: z.number().int().nullable().optional(),
    originalPrice: z.number().nullable().optional(),
    discount: z.string().nullable().optional(),
    allInclusive: z.boolean(),
    estimatedExtras: z.object({
      food: z.number().nullable().optional(),
      transport: z.number().nullable().optional(),
      beachAccess: z.number().nullable().optional()
    }).optional(),
    realCostEstimate: z.number().nullable().optional()
  }),
  rating: z.object({
    score: z.number().nullable(),
    label: z.string().nullable(),
    reviewCount: z.number().int().nullable()
  }).optional(),
  scores: z.object({
    location: z.number().int().min(1).max(5).describe('1=inland/far, 5=beachfront/prime'),
    value: z.number().int().min(1).max(5).describe('1=overpriced, 5=excellent value'),
    quality: z.number().int().min(1).max(5).describe('1=basic, 5=luxury'),
    reliability: z.number().int().min(1).max(5).describe('1=unknown/risky, 5=established brand'),
    separateSleeping: z.number().int().min(1).max(5).describe('1=same bed, 3=twin beds, 5=separate rooms'),
    quietness: z.number().int().min(1).max(5).describe('1=noisy/nightclub, 5=very quiet'),
    foodConvenience: z.number().int().min(1).max(5).describe('1=must cook, 5=all-inclusive'),
    amenities: z.number().int().min(1).max(5).describe('1=basic, 5=pool/spa/beach/gym'),
    overall: z.number().describe('Weighted average')
  }),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  dealbreakers: z.array(z.string()).optional(),
  property: z.object({
    type: z.string().optional(),
    bedrooms: z.number().int().nullable().optional(),
    livingRooms: z.number().int().nullable().optional(),
    bathrooms: z.number().int().nullable().optional(),
    kitchens: z.number().int().nullable().optional(),
    size: z.string().nullable().optional()
  }).optional(),
  adultsOnly: z.boolean().optional(),
  adultsOnlyAge: z.number().int().optional(),
  location: z.object({
    address: z.string().optional(),
    area: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    beachDistance: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).nullable().optional()
  }).optional(),
  concerns: z.object({
    noise: z.string().optional(),
    smoking: z.string().optional(),
    bedBugs: z.string().optional()
  }).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.object({
    thumbnail: z.string().nullable().optional(),
    gallery: z.array(z.string()).optional()
  }).optional(),
  verdict: z.string().optional(),
  notes: z.string().optional(),
  scraped: z.string().optional()
});

type Option = z.infer<typeof OptionSchema>;

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
  option?: Option;
}

function validateOption(filePath: string): ValidationResult {
  const fileName = path.basename(filePath);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    const result = OptionSchema.safeParse(json);

    if (result.success) {
      return {
        file: fileName,
        valid: true,
        errors: [],
        option: result.data
      };
    } else {
      const errors = result.error.issues.map(issue =>
        `${issue.path.join('.')}: ${issue.message}`
      );
      return {
        file: fileName,
        valid: false,
        errors
      };
    }
  } catch (e: any) {
    return {
      file: fileName,
      valid: false,
      errors: [`Parse error: ${e.message}`]
    };
  }
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCSV(options: Option[]): string {
  const headers = [
    'ID',
    'Type',
    'Name',
    'Provider',
    'Total (EUR)',
    'Real Cost Est.',
    'All-Inclusive',
    'Rating',
    'Reviews',
    'Location',
    'Value',
    'Quality',
    'Reliability',
    'Separate Sleep',
    'Quietness',
    'Food Conv.',
    'Amenities',
    'Overall',
    'Adults Only',
    'Pros',
    'Cons',
    'Verdict',
    'URL'
  ];

  const rows = options.map(opt => [
    opt.id,
    opt.type,
    opt.name,
    opt.provider,
    opt.pricing.total,
    opt.pricing.realCostEstimate || opt.pricing.total,
    opt.pricing.allInclusive ? 'Yes' : 'No',
    opt.rating?.score || '',
    opt.rating?.reviewCount || '',
    opt.scores.location,
    opt.scores.value,
    opt.scores.quality,
    opt.scores.reliability,
    opt.scores.separateSleeping,
    opt.scores.quietness,
    opt.scores.foodConvenience,
    opt.scores.amenities,
    opt.scores.overall,
    opt.adultsOnly ? 'Yes' : 'No',
    opt.pros.slice(0, 3).join('; '),
    opt.cons.slice(0, 3).join('; '),
    opt.verdict || '',
    opt.url
  ].map(escapeCSV).join(','));

  return [headers.join(','), ...rows].join('\n');
}

function main() {
  const optionsDir = path.join(__dirname, '../docs/options');
  const files = fs.readdirSync(optionsDir)
    .filter(f => f.startsWith('option-') && f.endsWith('.json'))
    .sort();

  console.log('🔍 Validating option files with Zod schema...\n');

  const results: ValidationResult[] = [];
  const validOptions: Option[] = [];

  for (const file of files) {
    const filePath = path.join(optionsDir, file);
    const result = validateOption(filePath);
    results.push(result);

    if (result.valid && result.option) {
      validOptions.push(result.option);
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
      result.errors.forEach(e => console.log(`   - ${e}`));
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`📊 Summary: ${validOptions.length}/${files.length} valid\n`);

  if (validOptions.length > 0) {
    // Sort by overall score descending
    validOptions.sort((a, b) => b.scores.overall - a.scores.overall);

    // Generate CSV
    const csv = generateCSV(validOptions);
    const csvPath = path.join(optionsDir, 'options.csv');
    fs.writeFileSync(csvPath, csv);
    console.log(`📁 CSV exported: docs/options/options.csv`);

    // Print quick summary table
    console.log('\n📋 Quick Summary (sorted by overall score):\n');
    console.log('ID         | Type           | Price   | Rating | Overall | All-Incl | Verdict');
    console.log('─'.repeat(90));

    for (const opt of validOptions) {
      const id = opt.id.padEnd(10);
      const type = opt.type.slice(0, 14).padEnd(14);
      const price = `€${opt.pricing.total}`.padEnd(7);
      const rating = (opt.rating?.score?.toString() || 'N/A').padEnd(6);
      const overall = opt.scores.overall.toFixed(1).padEnd(7);
      const allIncl = (opt.pricing.allInclusive ? 'Yes' : 'No').padEnd(8);
      const verdict = (opt.verdict || '').slice(0, 25);
      console.log(`${id} | ${type} | ${price} | ${rating} | ${overall} | ${allIncl} | ${verdict}`);
    }
  }
}

main();
