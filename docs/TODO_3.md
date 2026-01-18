# TODO 3: Hotel Images, Rankings & Activities

**Last Updated**: 2026-01-18

## Progress Summary
- [ ] Task 1: Update Rankings (0/4)
- [ ] Task 2: Fix 404 Links (0/3)
- [ ] Task 3: Get Hotel Images (0/7)
- [ ] Task 4: Research Activities (0/18)

---

## Task 1: Update Top 10 Rankings Based on 2BR Verification

- [ ] 1.1 Reprioritize rankings based on TRUE 2BR options
- [ ] 1.2 Move **Sunrise Remal Beach** to top priority (€2,656 Family Suite - best value 2BR)
- [ ] 1.3 Remove hotels without 2BR from top recommendations
- [ ] 1.4 Update property data with 2BR verification status

---

## Task 2: Fix 404 Links for Top 10 Hotels

- [ ] 2.1 Check each booking.com URL returns 200 (not 404)
- [ ] 2.2 Find correct/alternative URLs for broken links
- [ ] 2.3 Verify & fix known 404s: Hyatt Regency, Baron Palms

---

## Task 3: Get High-Quality Main Images (1024x768)

**CDN Pattern**: `https://cf.bstatic.com/xdata/images/hotel/max1024x768/{image_id}.jpg?k={key}`

| # | Hotel | Status |
|---|-------|--------|
| [ ] 3.1 | Sunrise Remal Beach (Melia Sinai) | Pending |
| [ ] 3.2 | Baron Palms | Pending |
| [ ] 3.3 | Rixos Golf Villas | Pending |
| [ ] 3.4 | Pickalbatros Palace (Melia Sharm) | Pending |
| [ ] 3.5 | Laguna Vista | Pending |
| [ ] 3.6 | Sunrise Montemare | Pending |
| [ ] 3.7 | Pyramisa | Pending |

**Requirements:**
- Format: JPEG
- Size: 1024x768 (landscape)
- Naming: `{hotel-slug}-main.jpg`
- Location: `/public/hotel-images/`

---

## Task 4: Research & Rank Activities for SSH

### 4.1 Research Sources
- [ ] 4.1.1 TripAdvisor Sharm el Sheikh activities
- [ ] 4.1.2 GetYourGuide tours
- [ ] 4.1.3 Viator experiences
- [ ] 4.1.4 Local blogs / travel forums
- [ ] 4.1.5 Reddit r/Egypt travel threads

### 4.2 Activities to Research & Rank
- [ ] 4.2.1 Snorkeling spots (house reefs vs boat trips)
- [ ] 4.2.2 Ras Mohammed National Park tours
- [ ] 4.2.3 Tiran Island boat trips
- [ ] 4.2.4 Desert safari options (quad bikes, camels, bedouin dinner)
- [ ] 4.2.5 Blue Hole diving/snorkeling
- [ ] 4.2.6 Glass bottom boat tours
- [ ] 4.2.7 Submarine tours
- [ ] 4.2.8 Old Market (Sharm el Sheikh)
- [ ] 4.2.9 Naama Bay promenade
- [ ] 4.2.10 Farsha Cafe sunset experience
- [ ] 4.2.11 Parasailing / water sports
- [ ] 4.2.12 Camel riding on the beach
- [ ] 4.2.13 Dolphin watching tours
- [ ] 4.2.14 Night safari / stargazing

### 4.3 Hidden Gems (not on TripAdvisor)
- [ ] 4.3.1 Research local recommendations
- [ ] 4.3.2 Hotel concierge tips
- [ ] 4.3.3 Off-the-beaten-path experiences

### 4.4 Deliverables
- [ ] 4.4.1 Create `/activities` route in egypt-web app
- [ ] 4.4.2 Rank top 10 activities with price, duration, booking info
- [ ] 4.4.3 Add activity images
- [ ] 4.4.4 Add to navigation

---

## Reference: Hotels WITH 2BR (Priority Order)

| Rank | Hotel | 2BR Room | Price (7 nights) |
|------|-------|----------|------------------|
| 1 | Sunrise Remal Beach | Family Suite | €2,656 |
| 2 | Baron Palms | Executive Suite 2BR | €5,004 |
| 3 | Rixos Golf Villas | Presidential Villa 4BR | €4,191 |
| 4 | Pickalbatros Palace | Villa Beach Front | €7,697 |
| 5 | Laguna Vista | Villa 4BR | €10,335 |
| 6 | Sunrise Montemare | Royal Villa | €12,074 |
| 7 | Pyramisa | Villa 4BR | €15,523 |

## Reference: Hotels WITHOUT 2BR (Deprioritize)
- Hilton Sharks Bay - No 2BR (beds in same room)
- Hyatt Regency - 404 on booking.com
- Savoy Sharm - No 2BR (living room only)
- Novotel - No 2BR
- Maritim Jolie Ville - No 2BR
- Sunrise Diamond - No 2BR
- Aqua Blu - No 2BR
- Naama Bay Suites - No 2BR
- Tiran Island - No 2BR

---

## Notes
- Booking.com image CDN: `cf.bstatic.com/xdata/images/hotel/`
- Resolutions: `square60`, `square600`, `max300`, `max500`, `max1024x768`, `max1280x900`
- Some hotels may have changed names or been delisted
