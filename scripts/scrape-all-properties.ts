#!/usr/bin/env npx tsx
/**
 * Scrape all Sharm el Sheikh properties from Booking.com
 * Uses Playwright MCP to scroll through infinite scroll and extract all properties
 *
 * Usage: npx tsx scripts/scrape-all-properties.ts
 *
 * NOTE: This script outputs instructions for browser_run_code since we can't
 * directly control the MCP from a script. Copy the JS to browser_run_code.
 */

// This is the code to run in browser_run_code - collects all properties by scrolling
const BROWSER_CODE = `
async (page) => {
  const seen = new Set();
  const allProperties = [];
  let noNewCount = 0;

  // Scroll and extract until no new properties
  while (noNewCount < 5) {
    // Extract current properties
    const properties = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('[data-testid="property-card"]').forEach(card => {
        const name = card.querySelector('[data-testid="title"]')?.textContent?.trim();
        const priceEl = card.querySelector('[data-testid="price-and-discounted-price"]');
        const ratingEl = card.querySelector('[data-testid="review-score"]');
        const linkEl = card.querySelector('a[data-testid="title-link"]');

        const ratingText = ratingEl?.textContent || '';
        const ratingMatch = ratingText.match(/(\\d+\\.?\\d*)/);
        const reviewsMatch = ratingText.match(/([\\d,]+)\\s*reviews/i);

        const url = linkEl?.href?.split('?')[0];
        if (url) {
          results.push({
            name,
            price: priceEl?.textContent?.trim()?.match(/€\\s*([\\d,]+)/)?.[1]?.replace(/,/g, '') || null,
            rating: ratingMatch ? parseFloat(ratingMatch[1]) : null,
            reviews: reviewsMatch ? parseInt(reviewsMatch[1].replace(/,/g, '')) : null,
            url
          });
        }
      });
      return results;
    });

    // Add new properties
    let newCount = 0;
    for (const prop of properties) {
      if (!seen.has(prop.url)) {
        seen.add(prop.url);
        allProperties.push(prop);
        newCount++;
      }
    }

    if (newCount === 0) {
      noNewCount++;
    } else {
      noNewCount = 0;
    }

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 3000));
    await page.waitForTimeout(800);

    // Check for "Show more results" button
    try {
      const showMore = await page.$('button:has-text("Show more results")');
      if (showMore && await showMore.isVisible()) {
        await showMore.click();
        await page.waitForTimeout(2500);
        noNewCount = 0;
      }
    } catch {}

    // Status update every 50 properties
    if (allProperties.length % 50 === 0 && newCount > 0) {
      console.log(\`Progress: \${allProperties.length} properties collected...\`);
    }
  }

  // Return summary + JSONL format for easy processing
  const jsonl = allProperties.map(p => JSON.stringify(p)).join('\\n');
  return {
    summary: \`Collected \${allProperties.length} unique properties\`,
    count: allProperties.length,
    jsonl
  };
}
`;

console.log('='.repeat(60));
console.log('BOOKING.COM PROPERTY SCRAPER');
console.log('='.repeat(60));
console.log('\nThis script provides the code to run in browser_run_code.');
console.log('\n1. First navigate to the search results:');
console.log('   browser_navigate: https://www.booking.com/searchresults.html?ss=Sharm+El+Sheikh&checkin=2026-02-15&checkout=2026-02-22&group_adults=2&no_rooms=2');
console.log('\n2. Then run this code in browser_run_code:\n');
console.log(BROWSER_CODE);
