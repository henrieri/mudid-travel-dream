# Property Verification Process

## Overview

This document describes the process for verifying 2-bedroom accommodation options on Booking.com for the Sharm el Sheikh trip (Feb 15-22, 2026).

## Goal

Verify that properties claiming to have "2-bedroom" or "Family Suite" options actually have **TRUE separate bedrooms** for snoring isolation, not just "2 beds in one room".

---

## Tools Used

| Tool | Purpose |
|------|---------|
| **Playwright MCP** | Browser automation, screenshots, accessibility snapshots |
| **Git LFS** | Large file storage for screenshots and HTML |
| **EasyOCR** | Text extraction from screenshots (optional verification) |

---

## Process Per Property

### Step 1: Navigate to Property
```javascript
browser_navigate({ url: "https://www.booking.com/hotel/eg/[property-name].html?checkin=2026-02-15&checkout=2026-02-22&group_adults=2&no_rooms=2" })
```

### Step 2: Capture Full Page Screenshot
```javascript
browser_take_screenshot({ filename: "[property-dir]/screenshot.png", fullPage: true })
```

### Step 3: Save HTML Source
```javascript
browser_evaluate({ function: "() => document.documentElement.outerHTML" })
// Save to [property-dir]/source.html
```

### Step 4: Find Room Types
```javascript
browser_evaluate({ function: `() => {
  const roomLinks = document.querySelectorAll('a[href*="#RD"], .hprt-roomtype-link');
  return Array.from(roomLinks).map(link => link.textContent.trim());
}` })
```

### Step 5: Scroll to 2BR Room and Screenshot
```javascript
browser_evaluate({ function: `() => {
  const roomLinks = document.querySelectorAll('a[href*="#RD"], .hprt-roomtype-link');
  for (const link of roomLinks) {
    if (link.textContent.includes('Family Suite') || link.textContent.includes('Two-Bedroom')) {
      link.scrollIntoView({ behavior: 'instant', block: 'center' });
      return 'Found';
    }
  }
}` })
browser_take_screenshot({ filename: "[property-dir]/family-suite.png" })
```

### Step 6: Create interpretation.md

Document the following in `interpretation.md`:

```markdown
# Property Verification: [Property Name]

## SUMMARY
| Field | Value |
|-------|-------|
| Property | [Name] |
| 2BR Option | [Room name] |
| 2BR Status | ✅ CONFIRMED / ❌ NOT TRUE 2BR |
| Price (AI) | €X,XXX |

## 2-BEDROOM VERIFICATION
### [Room Name] - CONFIRMED ✅

**Evidence:**
> [Quote from room description showing bedroom separation]

**Key Details:**
- Bedroom 1: [bed config]
- Bedroom 2: [bed config]
- Size: XXm²
- Lockable door: Yes/No/Not mentioned

**Pricing:**
| Meal Plan | Price |
|-----------|-------|
| Breakfast | €X,XXX |
| All-Inclusive | €X,XXX |

## FINAL VERDICT
[Summary of whether this is a true 2BR option]
```

---

## Directory Structure

```
apps/egypt-web/research-screenshots/
├── PROCESS.md          # This file
├── THOUGHTS.md         # Tracking and reminders
├── BOOKING_RESEARCH_NOTES.md  # Summary of all findings
├── .gitattributes      # Git LFS config
│
├── 1-sunrise-arabian-beach/
│   ├── screenshot.png      # Full page (Git LFS)
│   ├── source.html         # Raw HTML (Git LFS)
│   ├── snapshot.md         # Accessibility tree
│   ├── family-suite.png    # Focused screenshot
│   ├── interpretation.md   # Analysis
│   └── extracted-rooms.md  # Parsed room data
│
├── 2-white-hills-resort/
│   └── [same structure]
│
└── 3-royal-savoy/
    └── [same structure]
```

---

## Verification Criteria

### TRUE 2-Bedroom (✅ CONFIRMED)
- Room description explicitly mentions "2 bedrooms" or "2 bed rooms"
- Bedroom 1 and Bedroom 2 are listed separately with bed configurations
- Ideally mentions "lockable door" or "separate" bedrooms

### NOT True 2-Bedroom (❌ REJECTED)
- "Family room" with just multiple beds in same space
- "Suite" with living room + bedroom (1BR only)
- No clear separation mentioned

---

## Git LFS Setup

Large files tracked via Git LFS:
```
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.html filter=lfs diff=lfs merge=lfs -text
```

---

## Phase 1 Results (Verified 2026-01-18)

| Property | Room | 2BR Status | Price (AI) | Notes |
|----------|------|------------|------------|-------|
| Sunrise Arabian Beach | Family Suite | ✅ | €1,620-€1,800 | **LOCKABLE DOOR** mentioned |
| White Hills Resort | Family Suite | ✅ | €2,147-€2,385 | Explicit Bedroom 1/2 |
| Royal Savoy | Two-Bedroom Suite | ✅ | €3,424-€3,907 | Explicit Bedroom 1/2 |

---

## Next Steps

1. Continue Phase 2 with remaining promising properties
2. Update `BOOKING_RESEARCH_NOTES.md` with verified data
3. Update rankings in the web app
4. Deploy to production
