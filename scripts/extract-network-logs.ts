#!/usr/bin/env npx tsx
/**
 * Extract useful data from Playwright network trace files
 * Usage: npx tsx scripts/extract-network-logs.ts [trace-file] [--graphql] [--api] [--summary]
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NetworkEntry {
  type: string;
  snapshot: {
    startedDateTime: string;
    request: {
      method: string;
      url: string;
      postData?: { text: string };
    };
    response: {
      status: number;
      content?: {
        text?: string;
        mimeType?: string;
      };
    };
  };
}

function findLatestNetworkTrace(): string | null {
  const tracesDir = path.join(__dirname, '..', 'playwright-logs', 'traces');
  if (!fs.existsSync(tracesDir)) return null;

  const files = fs.readdirSync(tracesDir)
    .filter(f => f.endsWith('.network'))
    .sort()
    .reverse();

  return files.length > 0 ? path.join(tracesDir, files[0]) : null;
}

function parseNetworkTrace(filePath: string): NetworkEntry[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');

  return lines
    .map(line => {
      try {
        return JSON.parse(line) as NetworkEntry;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is NetworkEntry => entry !== null);
}

function extractGraphQLCalls(entries: NetworkEntry[]) {
  return entries.filter(e =>
    e.snapshot?.request?.url?.includes('graphql') ||
    e.snapshot?.request?.url?.includes('/dml/')
  ).map(e => ({
    time: e.snapshot.startedDateTime,
    url: e.snapshot.request.url,
    method: e.snapshot.request.method,
    status: e.snapshot.response?.status,
    hasResponse: !!e.snapshot.response?.content?.text
  }));
}

function extractAPICalls(entries: NetworkEntry[]) {
  return entries.filter(e => {
    const url = e.snapshot?.request?.url || '';
    const mimeType = e.snapshot?.response?.content?.mimeType || '';
    return (
      e.snapshot?.response?.status === 200 &&
      (mimeType.includes('json') || url.includes('/api/') || url.includes('graphql'))
    );
  }).map(e => ({
    time: e.snapshot.startedDateTime,
    url: e.snapshot.request.url.slice(0, 100),
    method: e.snapshot.request.method,
    status: e.snapshot.response.status,
    size: e.snapshot.response?.content?.text?.length || 0
  }));
}

function generateSummary(entries: NetworkEntry[]) {
  const byDomain: Record<string, number> = {};
  const byStatus: Record<number, number> = {};
  const byType: Record<string, number> = {};

  entries.forEach(e => {
    try {
      const url = new URL(e.snapshot?.request?.url || '');
      byDomain[url.hostname] = (byDomain[url.hostname] || 0) + 1;
    } catch {}

    const status = e.snapshot?.response?.status || 0;
    if (status > 0) byStatus[status] = (byStatus[status] || 0) + 1;

    const mimeType = e.snapshot?.response?.content?.mimeType || 'unknown';
    const type = mimeType.split('/')[0] || 'unknown';
    byType[type] = (byType[type] || 0) + 1;
  });

  return {
    totalRequests: entries.length,
    byDomain: Object.entries(byDomain).sort((a, b) => b[1] - a[1]).slice(0, 10),
    byStatus,
    byType
  };
}

function extractBookingSearchResults(entries: NetworkEntry[]) {
  // Look for search results in GraphQL responses
  const searchResults: any[] = [];

  entries.forEach(e => {
    const text = e.snapshot?.response?.content?.text;
    if (!text) return;

    try {
      const data = JSON.parse(text);
      // Look for property/hotel data patterns
      if (data?.data?.searchQueries?.search?.results) {
        searchResults.push({
          type: 'searchResults',
          count: data.data.searchQueries.search.results.length,
          sample: data.data.searchQueries.search.results.slice(0, 2)
        });
      }
    } catch {}
  });

  return searchResults;
}

// Main
const args = process.argv.slice(2);
const traceFile = args.find(a => !a.startsWith('--')) || findLatestNetworkTrace();

if (!traceFile) {
  console.error('No network trace file found');
  process.exit(1);
}

console.log(`📊 Analyzing: ${path.basename(traceFile)}\n`);

const entries = parseNetworkTrace(traceFile);

if (args.includes('--summary') || args.length === 0) {
  const summary = generateSummary(entries);
  console.log('📈 SUMMARY');
  console.log('─'.repeat(50));
  console.log(`Total requests: ${summary.totalRequests}`);
  console.log('\nTop domains:');
  summary.byDomain.forEach(([domain, count]) => {
    console.log(`  ${domain}: ${count}`);
  });
  console.log('\nBy status:');
  Object.entries(summary.byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  console.log('');
}

if (args.includes('--graphql')) {
  const graphql = extractGraphQLCalls(entries);
  console.log('🔷 GRAPHQL CALLS');
  console.log('─'.repeat(50));
  console.log(`Found ${graphql.length} GraphQL calls`);
  graphql.slice(0, 10).forEach(g => {
    console.log(`  [${g.status}] ${g.method} ${g.url.slice(0, 80)}`);
  });
  console.log('');
}

if (args.includes('--api')) {
  const api = extractAPICalls(entries);
  console.log('📡 API CALLS (JSON responses)');
  console.log('─'.repeat(50));
  console.log(`Found ${api.length} API calls with JSON responses`);
  api.slice(0, 15).forEach(a => {
    console.log(`  [${a.status}] ${a.method} ${a.url} (${a.size} bytes)`);
  });
  console.log('');
}

if (args.includes('--search')) {
  const search = extractBookingSearchResults(entries);
  console.log('🔍 BOOKING SEARCH RESULTS');
  console.log('─'.repeat(50));
  if (search.length > 0) {
    console.log(JSON.stringify(search, null, 2));
  } else {
    console.log('No search results found in trace');
  }
}
