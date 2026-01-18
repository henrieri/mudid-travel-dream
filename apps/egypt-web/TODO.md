# Egypt Web App - TODO

*Last updated: Jan 18, 2026*

## Completed

### Pages & Features
- [x] Dashboard (`/`) - Top picks overview
- [x] Rankings (`/rankings`) - Full ranked list with filters
- [x] Property Detail (`/property/:id`) - Detail view with vetting report
- [x] Findings (`/findings`) - 2BR verification report
- [x] Tips (`/tips`) - Travel tips with images
- [x] Activities (`/activities`) - 12 activities with AI images
- [x] Community (`/community`) - Reddit/TripAdvisor opinions
- [x] Budget (`/budget`) - Calculator with €750/pp flights
- [x] Evelina's Picks (`/evelina`) - Her research from xlsx

### Infrastructure
- [x] Egyptian-themed dark layout (slate-950 + amber accents)
- [x] Sidebar navigation with pyramid icon
- [x] Deployment pipeline with version metadata
- [x] Playwright verification tests (10/10 passing)
- [x] Make commands for y.local image generation
- [x] React Query SSR integration

### Data & Research
- [x] Vetting top 10 properties for red flags
- [x] Score breakdown in property cards
- [x] VettingReport component
- [x] Parse Evelina's xlsx research

---

## Remaining - Stub Pages

### Map (`/map`)
- [ ] Interactive map showing property locations
- [ ] Beach distances visualization
- [ ] Area highlights (Naama Bay, Sharks Bay, etc.)

### Compare (`/compare`)
- [ ] Side-by-side property comparison
- [ ] Select 2-3 properties to compare
- [ ] Score radar chart comparison
- [ ] Price/amenity matrix

### Favorites (`/favorites`)
- [ ] Save favorite properties (localStorage)
- [ ] Quick access to saved picks
- [ ] Notes per property

### Settings (`/settings`)
- [ ] Theme preferences
- [ ] Budget preferences
- [ ] Trip date configuration

---

## Nice to Have

### Property Detail Enhancements
- [ ] Image gallery/carousel
- [ ] Radar chart for score visualization
- [ ] Price history (if available)
- [ ] User notes section

### Database Integration
- [ ] Store vetting data in PostgreSQL
- [ ] Sync with `unified_metadata` table
- [ ] Live price updates from Booking.com

### Decision Helper
- [ ] Final recommendation wizard
- [ ] Budget vs comfort tradeoff calculator
- [ ] "Book Now" direct links

---

## Current Recommendation

Based on all research (Henri's + Evelina's):

| Rank | Property | Price | Why |
|------|----------|-------|-----|
| 1 | **Sharm Hills Luxury Pool View** | €1,043 | True 2BR, 10/10 rating, quiet, Evelina's top pick |
| 2 | Sunrise Remal Resort | €1,792 | All-inclusive, 9.4 rating, adults 16+ |
| 3 | Sunrise Arabian Beach | €1,379 | Good reviews, snorkeling from jetty |

**Flight**: Momondo charter €750/pp (5h10m direct TLL→SSH)

**Total Budget Estimate**: €1,043 + €1,500 (flights) + €300 (activities) = ~€2,850
