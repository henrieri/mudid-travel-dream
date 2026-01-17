# Henri & Evelina Property Scoring System

**Total: 100 points**

## 1. Snoring Isolation (35 points) - CRITICAL

Henri snores, Evelina needs quiet sleep. This is the most important factor.

| Accommodation Type | Points | Description |
|-------------------|--------|-------------|
| 2+ bedroom apartment/villa | 35 | Best option - completely separate bedrooms |
| 3-4 bedroom villa | 35 | Even better for privacy |
| 2-bedroom suite | 30 | Suite with separate bedroom area |
| Interconnecting rooms | 25 | 2 rooms with connecting door |
| Suite with separate bedroom | 20 | Partial separation |
| Twin beds only | 10 | Same room, separate beds |
| King/Double bed only | 0 | No isolation |

**Metadata keys used:**
- `has_2bedroom_apartment` → 35
- `has_2bedroom_villa` / `has_3bedroom_villa` / `has_4bedroom_villa` → 35
- `has_2bedroom_suite` → 30
- `has_interconnecting_rooms` → 25
- `has_separate_bedroom_suite` / `has_suite_with_bedroom` → 20
- `has_twin_beds` → 10

## 2. Beach Access (15 points)

| Distance | Points | Description |
|----------|--------|-------------|
| Beachfront (0m) | 15 | Private beach or direct access |
| < 100m | 12 | Very close |
| 100-500m | 8 | Short walk |
| 500m - 1km | 5 | Reasonable walk |
| > 1km or shuttle | 2 | Need transport |
| Unknown | 0 | No data |

**Metadata keys:** `is_beachfront`, `beach_distance`

## 3. Rating Quality (15 points)

| Rating | Points |
|--------|--------|
| 9.5+ | 15 |
| 9.0 - 9.4 | 12 |
| 8.5 - 8.9 | 8 |
| 8.0 - 8.4 | 4 |
| < 8.0 | 0 |

## 4. Adults-Only (10 points)

| Type | Points |
|------|--------|
| Adults only (16+ or 18+) | 10 |
| Families allowed | 0 |

**Metadata key:** `is_adults_only`

## 5. All-Inclusive (10 points)

| Type | Points |
|------|--------|
| All-inclusive | 10 |
| Half-board / B&B | 3 |
| Room only | 0 |

**Metadata key:** `is_all_inclusive`

## 6. Amenities (10 points)

Points accumulate (max 10):
- Pool(s) on site: +3
- Spa/wellness: +2
- Gym: +1
- Water park/aqua park: +2
- Private pool (villa): +3
- Multiple restaurants: +2

**Metadata keys:** `has_pool`, `has_private_pool`, `has_spa`, `has_gym`, `has_water_park`

## 7. Reliability (Reviews) (5 points)

| Review Count | Points |
|--------------|--------|
| 2000+ | 5 |
| 1000+ | 4 |
| 500+ | 3 |
| 100+ | 2 |
| < 100 | 0 |

---

## Score Tiers

| Score | Tier | Recommendation |
|-------|------|----------------|
| 80+ | Excellent | Book immediately |
| 65-79 | Very Good | Strong contender |
| 50-64 | Good | Worth considering |
| 35-49 | Average | Has significant drawbacks |
| < 35 | Poor | Skip unless desperate |

---

## Current Top Candidates (based on vetting)

### Properties with 2+ Separate Bedrooms:
1. **Sharm Hills** (ID 89) - 2BR apartment, beachfront, €741
2. **Royal Savoy** (ID 14) - 2BR suite, beachfront, €2,305
3. **Pickalbatros Aqua Park** (ID 200) - 2BR suite option, €1,219

### Properties with Interconnecting Rooms:
1. **Sunrise Diamond** (ID 11) - Adults-only, interconnecting, €2,358
2. **Maritim Jolie Ville** (ID 42) - Interconnecting rooms, €1,840

### Best Value with Twin Beds:
1. **Xperience Golden Sandy** (ID 65) - Adults-only, all-inclusive, €516

---

*Last updated: Jan 17, 2026*
