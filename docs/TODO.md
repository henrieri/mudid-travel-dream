# Travel Dream - TODO

## Current Sprint: Egypt Web App

### Phase 1: Unified Database Schema
- [ ] Create `unified_properties` table combining Booking.com + Airbnb
- [ ] Create `unified_metadata` table for flexible key-value storage
- [ ] Migrate existing properties + airbnb_properties data
- [ ] Add source tracking (booking.com, airbnb)

### Phase 2: Final Rankings
- [ ] Re-verify all 2-bedroom claims (Sunrise Montemare Family Suite was FALSE)
- [ ] Apply unified Henri Score to all properties
- [ ] Create final top 10 with verified room configurations
- [ ] Add price verification from live Booking.com data

### Phase 3: Egypt Web App (egypt.local)
- [ ] Copy apps/web to apps/egypt-web
- [ ] Remove unused components/routes
- [ ] Create new Egyptian-themed layout:
  - [ ] Dark theme base (slate-950)
  - [ ] Gold/amber accents (Egyptian gold)
  - [ ] Custom sidebar with pyramid/pharaoh icons
  - [ ] Property cards with score visualization
- [ ] Routes:
  - [ ] `/` - Dashboard with top picks
  - [ ] `/rankings` - Full ranked list with filters
  - [ ] `/property/:id` - Property detail view
  - [ ] `/compare` - Side-by-side comparison
  - [ ] `/budget` - Budget calculator
- [ ] Configure egypt.local ingress

### Phase 4: Property Detail Views
- [ ] Image gallery/carousel
- [ ] Score breakdown visualization (radar chart)
- [ ] Amenities grid
- [ ] Location info + beach distance
- [ ] Price history (if available)
- [ ] User notes section
- [ ] "Book Now" link to source

---

## Verified Findings (Jan 17, 2026)

### Room Configuration Reality Check
| Property | Claimed | Verified | Notes |
|----------|---------|----------|-------|
| Sunrise Montemare Family Suite | 2BR | ❌ 1 room (55m²) | Twin beds in SAME room |
| Sharm Hills 2BR Apartment | 2BR | ✅ TRUE 2BR | 96m², separate bedrooms |
| Royal Savoy 2BR Suite | 2BR | ✅ TRUE 2BR | €3,376+ for 2BR |

### Budget Analysis
- Henri's budget: Up to €1,500 for accommodation
- Best value 2BR: Sharm Hills €885 (but not all-inclusive)
- With food costs: €885 + €400 = €1,285 total
- All-inclusive 2BR: €3,000+ (over budget)

---

## Data Sources

### Booking.com
- 388 properties scraped
- 50 vetted with metadata
- Scores calculated for vetted properties

### Airbnb
- 51 properties in database
- 30 premium properties (Pool + Beachfront filter)
- Images stored for UI display

---

## Completed

### Jan 17, 2026
- [x] Scrape 388 properties from Booking.com
- [x] Create PostgreSQL database schema
- [x] Vet top properties for snoring isolation options
- [x] Develop Henri Score algorithm (100 points)
- [x] Scrape 51 Airbnb properties with images
- [x] Verify Sunrise Montemare (NOT true 2BR)
- [x] Verify Sharm Hills (TRUE 2BR - €885)
- [x] Create EGYPT_TIPS.md travel guide
- [x] Budget analysis based on Henri's income profile

---

*Last updated: Jan 17, 2026*
