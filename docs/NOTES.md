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

### Session Management
- Playwright uses persistent Chrome profile at `~/.cache/ms-playwright/mcp-chrome-*`
- Session cookies persist between uses (stays logged in)
- If Claude session crashes, Playwright browser may still be open
- To reuse: just call browser_snapshot to reconnect

### Booking.com Scraping Tips
1. **Use browser_snapshot first** - Get accessibility tree, not screenshots
2. **Wait for dynamic content** - Use `browser_wait_for` for loading
3. **Use refs from snapshot** - Click using element refs, not coordinates
4. **Watch for popups** - Cookie consent, login prompts, etc.

### Common Workflow
```
1. browser_navigate → go to URL
2. browser_snapshot → see page state
3. browser_click → interact with elements (using ref from snapshot)
4. browser_wait_for → wait for content to load
5. browser_snapshot → see results
```

### Handling Login
- Booking.com keeps you logged in via cookies
- Check for user name in snapshot to confirm logged in
- If logged out, may need to re-authenticate

### Extracting Hotel Data
- Price is in "price" or "data-testid" attributes
- Rating shown as score (e.g., "9.1 Wonderful")
- Review count usually near rating
- Use evaluate() for complex data extraction

### Common Issues
- **Empty snapshot**: Page still loading - use wait_for
- **Popup blocking**: Close cookie/newsletter popups first
- **Session expired**: Need to log in again

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

**Sharm el Sheikh Feb 15-22, 2026**

### Booked
- [ ] Flights: €1,515 (Heston Airlines) - NOT YET BOOKED

### Top Hotel Candidates
1. **Pickalbatros Royal Grand** (€1,023) - Adults 16+, 9.4 rating
   - Pros: Adults only, top rated
   - Cons: Has nightclub
   - Ask for: Room away from entertainment

2. **Verginia Sharm Resort** (€565) - 9.1 rating
   - Pros: "Quiet part" of town, adults-only pool, best value
   - Cons: Older facilities
   - Ask for: Room near quiet pool

3. **Naama Bay Promenade** (€436) - Budget option
   - Pros: Prime location, Accor managed
   - Cons: Lower rating (7.7)

### Decision Pending
- [ ] Choose between Pickalbatros (premium) vs Verginia (value)
- [ ] Decide: 1 room with twin beds OR 2 separate rooms

---

## Airbnb Notes

- Logged in to Airbnb (as of Jan 17, 2026)
- Could explore villa/apartment options
- May offer better separation (2 bedrooms)
- Check: Delta Sharm 2BR apartment option

---

*Last updated: Jan 17, 2026*
