# Egypt Web - Vetting & Data Tasks

## Current Session Tasks (Jan 17, 2026)

### 1. Vetting Top 10 Properties for Red Flags
Status: **Complete** (10/10)

Vetting involves checking reviews for:
- Noise complaints
- Cleanliness issues (dirty, unclean)
- Pests (cockroaches, bed bugs, ants, mosquitoes)
- Mold/mould
- Maintenance issues (broken items)
- Scam reports
- Safety features (smoke alarm, CO alarm)

#### Vetting Results Summary:

| # | Property | Rating | Reviews | Red Flags | Safety | Notes |
|---|----------|--------|---------|-----------|--------|-------|
| 1 | Sharm Hills (Booking) | 9.8 | 77 | None | N/A | Excellent scores across all categories |
| 2 | Sharm Hills Guest Favorite (Airbnb) | 5.0 | 23 | None | No smoke/CO | Minor: "acceptable for Sharm standards" cleaning |
| 3 | Sharm Hills luxury 2BR (Airbnb) | 4.78 | 23 | **MOSQUITOES** | No smoke/CO | Review explicitly mentions mosquitoes |
| 4 | Beach Resort Villa Nabq (Airbnb) | 4.63 | 27 | **CLEANLINESS** | No smoke | 2-star review: dirty garden, broken items, neglected |
| 5 | Lucky Step Apartments (Airbnb) | 5.0 | 20 | None | No smoke/CO | TOP 10% Guest Favorite, Superhost |
| 6 | Magnificent Seafront Penthouse (Airbnb) | 5.0 | 6 | None* | No smoke/CO | *Host warns about pests in listing description |
| 7 | Seafront apartment Sharks Bay (Airbnb) | 5.0 | 18 | None | No smoke/CO | TOP 5% Guest Favorite, Superhost |
| 8 | Beachfront Resort 2BR (Airbnb) | N/A | 1 | **NOISE, CASINO** | No smoke | "Behind casino, can be noisy" - only 3-star review |
| 9 | Sharm Hills Haven (Airbnb) | 5.0 | 1 | None | Has both | Limited reviews, new host |
| 10 | Sharm Hills Two bedrooms (Airbnb) | 5.0 | 5 | None | No smoke/CO | Guest Favorite, new host (4 months) |

### 2. Database Storage
Status: **Pending**

- Local PostgreSQL running via docker-compose on port 5623
- Schema: `unified_properties` table + `unified_metadata` table
- Need to store vetting results as metadata per property

**Approach:**
1. Store vetting data in `unified_metadata` table with keys like:
   - `vetting_date`
   - `vetting_red_flags` (JSON array)
   - `vetting_safety_smoke`
   - `vetting_safety_co`
   - `vetting_review_sample`
   - `vetting_verdict`
2. Also update `unified-properties.json` for frontend

### 3. Create VettingReport Component
Status: **Complete**

Created `/apps/egypt-web/src/components/VettingReport.tsx` with:
- Verdict display (Clear / Concerns / Red Flags)
- Vetting date
- What was checked (8 red flag patterns)
- Red flags found displayed as badges
- Safety features (smoke/CO alarms)
- Review excerpts as evidence
- Notes section
- Egyptian theme styling

### 4. Fix Score Breakdown Issue
Status: **Complete**

Root cause: `unified-properties.json` was missing score breakdown fields.
- Added `score_snoring`, `score_beach`, `score_rating`, `score_adults`, `score_allinc`, `score_amenities`, `score_reliability` to all properties
- Added `henri_tier` field
- Scores derived from property characteristics (2BR = 35 snoring, beachfront = 15 beach, etc.)

### 5. Update Property Detail Page
Status: **Complete**

- Imported VettingReport component
- Added VettingData type to Property interface
- Rendered VettingReport after Snoring Assessment section
- Vetting data included in unified-properties.json

---

## Booking.com Hotel Search (Jan 17, 2026)

Search criteria: Sharm el Sheikh, Feb 15-22 2026, 2 rooms, All-Inclusive filter, budget €2,200

### Hotels Evaluated:

| Hotel | Price (2 rooms) | Rating | Beach | All-Inc | Adults Only | Status |
|-------|-----------------|--------|-------|---------|-------------|--------|
| **Sunrise Remal Resort** | €1,792 | 9.4 | 800m | ✅ | 16+ | ✅ RECOMMENDED |
| **Pickalbatros Royal Grand** | €2,046 | 9.4 | 1.4km | ✅ | 16+ | ✅ PREMIUM OPTION |
| Novotel Sharm | €1,636 | 9.1 | 100m | ❌ | No | Room Only - no AI |

### Sunrise Remal Resort Details:
- **Location**: Sharks Bay, 800m from beach (shuttle available)
- **Rating**: 9.4 on Booking.com
- **All-Inclusive**: Full buffet meals, unlimited drinks, snacks
- **Adults Only**: 16+ policy
- **Price breakdown**: €896/room × 2 = €1,792 total
- **Amenities**: 5 pools, spa, gym, beach access
- **Red flags**: None found in reviews

### Pickalbatros Royal Grand Details:
- **Location**: Naama Bay, 1.4km from beach (shuttle available)
- **Rating**: 9.4 on Booking.com
- **All-Inclusive**: Premium AI with multiple restaurants, unlimited drinks
- **Adults Only**: 16+ policy (adults-focused environment)
- **Price breakdown**: €1,023/room × 2 = €2,046 total
- **Amenities**: Private beach area, multiple pools, spa, entertainment
- **Red flags**: None found in reviews
- **Note**: Premium option with higher comfort level

---

## Updated Rankings (Jan 17, 2026)

**Ranking criteria:**
1. No red flags (Clear/Minor Concerns only)
2. All-inclusive availability (bonus)
3. Rating quality
4. Price value

**Properties DERANKED due to red flags:**
- #72 Sharm Hills luxury 2BR: MOSQUITOES → moved to #10
- #121 Beachfront Resort 2BR: NOISE, CASINO → moved to #11
- #115 Beach Resort Villa: CLEANLINESS, MAINTENANCE → moved to #12

**Properties PROMOTED:**
- #74 Lucky Step: Clear, 5.0 rating → #5
- #119 Sharm Hills Haven: Clear, has safety alarms → #6
- #91 Sharm Hills Two bedrooms: Clear, 5.0 rating → #7

**NEW ADDITIONS:**
- Sunrise Remal Resort: All-Inclusive hotel, €1,792 → #2
- Pickalbatros Royal Grand: Premium All-Inclusive, €2,046 → #3

---

## Red Flag Patterns Checked

```javascript
const patterns = [
  { regex: /\bnoisy\b|\bnoise\b|\bloud\b/gi, flag: 'NOISE' },
  { regex: /\bdirty\b|\bunclean\b|\bfilthy\b/gi, flag: 'CLEANLINESS' },
  { regex: /\bcockroach/gi, flag: 'PESTS' },
  { regex: /bed\s*bug/gi, flag: 'BED_BUGS' },
  { regex: /\bants\b/gi, flag: 'ANTS' },
  { regex: /mosquito/gi, flag: 'MOSQUITOES' },
  { regex: /\bsmelly\b|\bbad smell\b|\bodor\b/gi, flag: 'ODOR' },
  { regex: /\bmold\b|\bmould\b/gi, flag: 'MOLD' },
  { regex: /\bbroken\b/gi, flag: 'MAINTENANCE' },
  { regex: /\btheft\b|\bstolen\b/gi, flag: 'SAFETY' },
  { regex: /\bscam\b/gi, flag: 'SCAM' },
  { regex: /\brude\b/gi, flag: 'SERVICE' },
  { regex: /no hot water/gi, flag: 'HOT_WATER' },
];
```

## Files to Modify

1. `/apps/egypt-web/public/unified-properties.json` - Add vetting data
2. `/apps/egypt-web/src/routes/property.$id.tsx` - Add VettingReport component
3. `/apps/egypt-web/src/components/VettingReport.tsx` - New component (create)
4. Database: `unified_metadata` table - Insert vetting records
