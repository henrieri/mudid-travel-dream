#!/usr/bin/env npx tsx
/**
 * Safely extract property/hotel data from Playwright network traces
 * Handles massive JSON-line files by reading in chunks
 *
 * Usage: npx tsx scripts/extract-properties.ts [--output file.json]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const TRACES_DIR = path.join(__dirname, '..', 'playwright-logs', 'traces');
const MAX_LINE_LENGTH = 500_000; // Skip lines over 500KB to avoid memory issues

interface Property {
  id: string;
  name: string;
  url?: string;
  price?: string;
  rating?: string;
  reviewCount?: number;
  location?: string;
}

function findLatestNetworkTrace(): string | null {
  if (!fs.existsSync(TRACES_DIR)) return null;
  const files = fs.readdirSync(TRACES_DIR)
    .filter(f => f.endsWith('.network'))
    .sort()
    .reverse();
  return files.length > 0 ? path.join(TRACES_DIR, files[0]) : null;
}

async function extractPropertiesFromTrace(tracePath: string): Promise<Property[]> {
  const properties: Map<string, Property> = new Map();

  const fileStream = fs.createReadStream(tracePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNum = 0;
  let skippedLines = 0;
  let processedLines = 0;

  for await (const line of rl) {
    lineNum++;

    // Skip extremely long lines to avoid memory issues
    if (line.length > MAX_LINE_LENGTH) {
      skippedLines++;
      continue;
    }

    try {
      const entry = JSON.parse(line);
      const responseText = entry?.snapshot?.response?.content?.text;
      if (!responseText) continue;

      // Look for GraphQL search results
      const data = JSON.parse(responseText);

      // Booking.com search results pattern
      const results = data?.data?.searchQueries?.search?.results;
      if (results && Array.isArray(results)) {
        for (const result of results) {
          const basicInfo = result?.basicPropertyData;
          const priceInfo = result?.priceDisplayInfoIrene;

          if (basicInfo?.id) {
            const id = String(basicInfo.id);
            if (!properties.has(id)) {
              properties.set(id, {
                id,
                name: basicInfo.name?.text || 'Unknown',
                url: basicInfo.pageName ? `https://www.booking.com/hotel/eg/${basicInfo.pageName}.html` : undefined,
                price: priceInfo?.displayPrice?.amountPerStay?.amountRounded || undefined,
                rating: basicInfo.reviewScore?.score ? String(basicInfo.reviewScore.score) : undefined,
                reviewCount: basicInfo.reviewScore?.reviewCount || undefined,
                location: basicInfo.location?.displayLocation || undefined
              });
            }
          }
        }
        processedLines++;
      }
    } catch {
      // Skip unparseable lines
    }
  }

  console.error(`Processed ${lineNum} lines (${skippedLines} skipped as too long, ${processedLines} contained results)`);
  return Array.from(properties.values());
}

async function main() {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex >= 0 ? args[outputIndex + 1] : null;

  const tracePath = findLatestNetworkTrace();
  if (!tracePath) {
    console.error('No network trace found in playwright-logs/traces/');
    process.exit(1);
  }

  console.error(`📊 Extracting from: ${path.basename(tracePath)}`);
  console.error(`   File size: ${(fs.statSync(tracePath).size / 1024 / 1024).toFixed(2)} MB\n`);

  const properties = await extractPropertiesFromTrace(tracePath);

  console.error(`\n✅ Found ${properties.length} unique properties\n`);

  const output = JSON.stringify(properties, null, 2);

  if (outputFile) {
    fs.writeFileSync(outputFile, output);
    console.error(`Written to: ${outputFile}`);
  } else {
    // Only output first 50KB to stdout to avoid terminal issues
    if (output.length > 50_000) {
      console.log(output.slice(0, 50_000));
      console.error(`\n... truncated (${output.length} total chars). Use --output file.json to get full data.`);
    } else {
      console.log(output);
    }
  }
}

main().catch(console.error);
