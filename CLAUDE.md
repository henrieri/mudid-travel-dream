# Travel Dream Project

Trip planning assistant project for Sharm el Sheikh Feb 2026.

## CRITICAL: Handling Large Log Files

**NEVER use tail/head/cat directly on Playwright traces or network logs** - These files often have massive single-line JSON entries (2MB+ per line). Line-based limits are useless and WILL crash the session.

### Safe Approach: Always pipe to temp file with char limits first

```bash
# ALWAYS do this - extract first N chars to a temp file, THEN read
head -c 50000 massive-file.log > /tmp/preview.log
cat /tmp/preview.log

# Or use scripts that stream-process line by line (see scripts/extract-properties.ts)
npx tsx scripts/extract-properties.ts --output /tmp/results.json

# NEVER do this - will crash with 2MB single-line JSON
tail -100 trace.network
head -100 trace.network
cat trace.network | head
```

### For the Read tool
The `limit` parameter limits by LINES not characters. For JSON-line files with huge lines, this is dangerous. Always use Bash with `head -c` to a temp file first.

### Safe log inspection pattern
```bash
# 1. Check file size first
ls -lh file.log

# 2. Get first 50KB to temp file
head -c 50000 file.log > /tmp/preview.txt

# 3. Now safe to read
cat /tmp/preview.txt
```

## Project Structure

- `docs/options/` - Accommodation options as structured JSON (validated by Zod schema)
- `docs/hotels/` - Individual hotel research notes
- `docs/NOTES.md` - Henri & Evelina's preferences, Playwright tips, decision status
- `scripts/validate-options.ts` - Zod validation for option files
- `scripts/extract-network-logs.ts` - Parse Playwright network traces

## Key Files

- `docs/options/schema.json` - JSON Schema for accommodation options
- `docs/options/options.csv` - Summary spreadsheet of all options with scores
- `docs/options/SUMMARY.md` - Human-readable comparison matrix

## Scoring System (1-5)

- `location`: 1=inland, 5=beachfront
- `value`: 1=overpriced, 5=excellent value
- `quality`: 1=basic, 5=luxury
- `reliability`: 1=unknown, 5=established brand
- `separateSleeping`: 1=same bed, 3=twin beds, 5=separate rooms
- `quietness`: 1=noisy/nightclub, 5=very quiet
- `foodConvenience`: 1=must cook, 5=all-inclusive
- `amenities`: 1=basic, 5=pool/spa/beach/gym
