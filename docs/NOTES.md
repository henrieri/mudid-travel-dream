# Travel Planning Notes

## Henri & Evelina's Preferences

### Evelina's Requirements (Must Have)
1. **Quiet at night** - Needs quiet for sleeping
   - Music during day is OK
   - Night-time quiet is critical
   - Request room away from nightclub/entertainment area
2. **Non-smoking room** - Must be non-smoking
3. **No bed bugs** - Major concern, check recent reviews
4. **Clean room** - Cleanliness matters

### Henri's Requirements
1. **Snoring accommodation** - Henri snores, needs solution for Evelina
   - **Best solution**: Book room with **2 TWIN BEDS** (same price as double)
   - Alternative: Two adjacent rooms if twin beds not enough

### Couple Preferences
- Adults-only hotels preferred (no screaming kids)
- Good location (Naama Bay is prime area in Sharm)
- All-inclusive preferred for convenience
- Beach access important

---

## Hotel Selection Checklist

When evaluating hotels:
- [ ] Check for bed bug reports in 2025-2026 reviews (TripAdvisor, Booking.com)
- [ ] Confirm non-smoking rooms available
- [ ] Check if nightclub/amphitheater on property (noise risk)
- [ ] Look for "quiet pool" or adults-only areas
- [ ] Check if 2 twin beds option available
- [ ] Verify beach access (private beach vs public)
- [ ] Check distance from airport

---

## Playwright MCP Tips for Booking.com

### MCP Configuration (Jan 2026)

Config file: `~/.claude/plugins/cache/claude-plugins-official/playwright/<version>/.mcp.json`

```json
{
  "playwright": {
    "command": "npx",
    "args": [
      "@playwright/mcp@latest",
      "--save-trace",
      "--save-session",
      "--console-level", "debug",
      "--output-dir", "/absolute/path/to/playwright-logs"
    ]
  }
}
```

**Available flags** (from `npx @playwright/mcp --help`):
- `--browser <browser>` - chrome, firefox, webkit, msedge
- `--save-trace` - Save Playwright trace to output-dir
- `--save-session` - Save session snapshots
- `--console-level <level>` - error, warning, info, debug
- `--output-dir <path>` - Where to save logs (use absolute path!)
- `--headless` - Run without visible browser
- `--isolated` - Fresh context each time (no persistent cookies)
- `--storage-state <path>` - Load saved login state

### Session Management
- Playwright uses persistent Chrome profile at `~/.cache/ms-playwright/mcp-chrome-*`
- Session cookies persist between uses (stays logged in as Henri Erilaid)
- If Claude session crashes, Playwright browser may still be open
- Kill orphaned browsers: `pkill -f "mcp-chrome"` or `pkill -f chrome`
- To reuse: just call browser_snapshot to reconnect

### Best Data Extraction Method: DOM Evaluation

**DON'T parse snapshots** - they're huge and truncated. **DO use `browser_run_code`**:

```javascript
async (page) => {
  const data = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('[data-testid="property-card"]').forEach(card => {
      results.push({
        name: card.querySelector('[data-testid="title"]')?.textContent?.trim(),
        price: card.querySelector('[data-testid="price-and-discounted-price"]')?.textContent?.trim(),
        rating: card.querySelector('[data-testid="review-score"]')?.textContent?.trim()
      });
    });
    return results;
  });
  return JSON.stringify(data, null, 2);
}
```

### Key Booking.com Selectors

| Data | Selector |
|------|----------|
| Property card | `[data-testid="property-card"]` |
| Hotel name | `[data-testid="title"]` |
| Price | `[data-testid="price-and-discounted-price"]` |
| Rating | `[data-testid="review-score"]` |
| Room table | `[data-testid="property-rooms-table"]` |
| Room name | `[data-testid="room-name"]` |
| Bed type | `[data-testid="bed-type"]` |
| Price per stay | `[data-testid="price-for-x-nights"]` |

### Network Trace Analysis

Traces saved to `playwright-logs/traces/`:
- `trace-*.trace` - View at https://trace.playwright.dev
- `trace-*.network` - JSON Lines with all XHR (GraphQL at `/dml/graphql`)
- `trace-*.stacks` - Stack traces

Use extraction script:
```bash
npx tsx scripts/extract-network-logs.ts --summary --graphql --api
```

### Common Workflow
```
1. browser_navigate → go to URL
2. browser_run_code → extract data with page.evaluate()
3. browser_click → interact with elements (using ref from snapshot)
4. browser_wait_for → wait for content to load
5. Repeat extraction
```

### Common Issues & Fixes
- **"Opening in existing browser session"** → `pkill -f chrome` then retry
- **Empty snapshot / timeout** → Page still loading, use `browser_wait_for`
- **Snapshot too large** → Use `browser_run_code` with `page.evaluate()` instead
- **net::ERR_NETWORK_CHANGED** → Browser was killed, just retry navigate
- **Popup blocking** → Close cookie/newsletter popups first

### Token-Efficient Property Data Extraction

**Problem**: Full page snapshots are 150K-300K chars, get truncated, waste tokens.

**Solution**: Single `browser_run_code` call extracts ALL needed data:

```javascript
async (page) => {
  const name = await page.$eval('h2', el => el.textContent?.trim()).catch(() => 'Unknown');
  const rating = await page.$eval('[data-testid="review-score-component"]', el => el.textContent?.trim()).catch(() => 'N/A');

  // Room types with twin bed detection
  const roomTypes = await page.$$eval('.hprt-table tr', els =>
    els.slice(0, 10).map(el => el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 250))
  ).catch(() => []);

  const hasTwinBeds = roomTypes.some(r => r && (r.toLowerCase().includes('twin') || r.toLowerCase().includes('2 single')));
  const hasSeparateRooms = roomTypes.some(r => r && (r.toLowerCase().includes('interconnect') || r.toLowerCase().includes('2 bedroom') || r.toLowerCase().includes('separate bedroom')));

  // Adults-only detection
  const pageText = await page.evaluate(() => document.body.innerText.slice(0, 15000));
  const isAdultsOnly = pageText.toLowerCase().includes('adults only') || pageText.includes('16+') || pageText.includes('18+');

  // Distance extraction
  const distances = await page.evaluate(() => {
    const text = document.body.innerText;
    const beachMatch = text.match(/(?:Beaches|Beach)[^\n]*?(\d+\.?\d*\s*(?:km|m))/i);
    const airportMatch = text.match(/Airport[^\n]*?(\d+\.?\d*\s*(?:km|m))/i);
    return { beach: beachMatch?.[1], airport: airportMatch?.[1] };
  });

  // Highlights/amenities
  const highlights = await page.$$eval('[data-testid="property-most-popular-facilities-wrapper"] li', els =>
    els.slice(0, 12).map(el => el.textContent?.trim())
  ).catch(() => []);

  // Review scores
  const reviewScores = await page.$$eval('[data-testid="review-subscore"]', els =>
    els.map(el => el.textContent?.replace(/\s+/g, ' ').trim())
  ).catch(() => []);

  return { name, rating, hasTwinBeds, hasSeparateRooms, isAdultsOnly, distances, highlights, reviewScores };
}
```

**Benefits**:
- ~2-3KB response vs 150KB+ snapshot
- All critical fields in ONE call
- No truncation issues
- Can process 20+ properties per session easily

### Booking.com GraphQL API (Advanced)

Network traces show Booking.com uses GraphQL at `/dml/graphql`. Key queries:
- `SearchResultsQuery` - Search results with filters
- `PropertyQuery` - Full property details
- `RoomAvailabilityQuery` - Room types and prices

To capture: Enable `--save-trace` in MCP config, then analyze with:
```bash
npx tsx scripts/extract-network-logs.ts --graphql
```

Raw responses can be stored in `property_raw_data` table for later analysis.

---

## Data Schema

See `docs/options/schema.json` for the structured accommodation option format.

Key scores (1-5 scale):
- `location`: 1=inland, 5=beachfront
- `value`: 1=overpriced, 5=excellent value
- `quality`: 1=basic, 5=luxury
- `reliability`: 1=unknown, 5=established brand
- `separateSleeping`: 1=same bed, 3=twin beds, 5=separate rooms
- `quietness`: 1=noisy/nightclub, 5=very quiet
- `foodConvenience`: 1=must cook, 5=all-inclusive
- `amenities`: 1=basic, 5=pool/spa/beach/gym

---

## Current Trip Status

**Sharm el Sheikh Feb 15-22, 2026** (7 nights, 2 adults, 2 rooms with twin beds)

### Booked
- [ ] Flights: €1,515 (Heston Airlines) - NOT YET BOOKED

### Top Hotel Options (Jan 17, 2026 prices for 2 rooms)

| Rank | Hotel | Price | Rating | Adults Only | Twin Beds | All-Incl |
|------|-------|-------|--------|-------------|-----------|----------|
| 🥇 | **Xperience Golden Sandy** | €516 | 8.6 | Yes | ✅ | ✅ |
| 🥈 | Xperience Sea Breeze | €1,073 | 9.0 | No | ✅ | ✅ |
| 🥉 | Verginia Sharm | €1,130 | 9.1 | No | ✅ | ✅ |
| 4 | Sunrise Remal | €1,325 | 9.4 | No | ✅ | ✅ |
| 5 | Pickalbatros Royal Grand | €1,740 | 9.4 | 16+ | ✅ | ✅ |
| 6 | Baron Palms | €2,162 | 9.4 | 16+ | ✅ | ✅ |

**⚠️ Skip: Meraki Resort** (€2,228) - 9.5 rating but ONLY king beds, no twin option!

### Best Value Analysis
- **Budget winner**: Xperience Golden Sandy (€516) - all requirements met!
- **Mid-range**: Sunrise Remal (€1,325) - highest rated at reasonable price
- **Premium**: Pickalbatros Royal Grand (€1,740) - adults-only + top quality

### Decision Pending
- [ ] Choose tier: Budget (€516) / Mid (€1,073-1,325) / Premium (€1,740+)
- [ ] Verify Xperience Golden Sandy reviews for quietness & cleanliness
- [ ] Check if any hotels have quiet room guarantee

---

## Airbnb Notes

- Logged in to Airbnb (as of Jan 17, 2026)
- Could explore villa/apartment options
- May offer better separation (2 bedrooms)
- Check: Delta Sharm 2BR apartment option

---

*Last updated: Jan 17, 2026*
