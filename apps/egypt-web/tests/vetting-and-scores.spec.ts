import { test, expect } from '@playwright/test'

const BASE_URL = 'http://egypt.local'

// Top 12 property IDs and their expected vetting verdicts (including 2 new hotels)
const PROPERTIES = [
  { id: 41, name: 'Sharm Hills', verdict: 'Clear', hasRedFlags: false, snoring: '35/35', rank: 1 },
  { id: 201, name: 'Sunrise Remal Resort', verdict: 'Clear', hasRedFlags: false, snoring: '35/35', rank: 2 },
  { id: 202, name: 'Pickalbatros Royal Grand', verdict: 'Clear', hasRedFlags: false, snoring: '35/35', rank: 3 },
  { id: 118, name: 'Sharm Hills (Guest favorite)', verdict: 'Clear', hasRedFlags: false, snoring: '35/35', rank: 4 },
  { id: 74, name: 'Lucky Step Apartments', verdict: 'Clear', hasRedFlags: false, snoring: '35/35', rank: 5 },
  { id: 119, name: 'Sharm Hills Haven', verdict: 'Clear', hasRedFlags: false, snoring: '35/35', rank: 6 },
  { id: 91, name: 'Sharm Hills Two bedrooms', verdict: 'Clear', hasRedFlags: false, snoring: '35/35', rank: 7 },
  { id: 73, name: 'Seafront apartment - sharks bay', verdict: 'Clear', hasRedFlags: false, snoring: '35/35', rank: 8 },
  { id: 79, name: 'Magnificent Seafront Penthouse', verdict: 'Minor Concerns', hasRedFlags: false, snoring: '35/35', rank: 9 },
  { id: 72, name: 'Sharm Hills luxury 2 bedrooms', verdict: 'Red Flags', hasRedFlags: true, redFlag: 'MOSQUITOES', snoring: '35/35', rank: 10 },
  { id: 121, name: 'Beachfront Resort 2 Bedroom', verdict: 'Red Flags', hasRedFlags: true, redFlag: 'NOISE', snoring: '35/35', rank: 11 },
  { id: 115, name: 'Beach Resort Luxury Private Villa', verdict: 'Red Flags', hasRedFlags: true, redFlag: 'CLEANLINESS', snoring: '35/35', rank: 12 },
]

test.describe('Property Detail Page - Vetting & Scores', () => {
  test('Homepage loads and shows 101 Properties', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page.getByText('101 Properties')).toBeVisible()
  })

  test('Rankings page loads with top 10 properties', async ({ page }) => {
    await page.goto(`${BASE_URL}/rankings`)
    await expect(page.getByRole('heading', { name: 'Property Rankings' })).toBeVisible()
    // Check first property is visible
    await expect(page.getByText('Sharm Hills').first()).toBeVisible()
  })

  test('Property #41 (Sharm Hills) has correct score breakdown', async ({ page }) => {
    await page.goto(`${BASE_URL}/property/41`)

    // Wait for data to load
    await expect(page.getByText('35/35')).toBeVisible({ timeout: 10000 })

    // Verify Henri Score
    await expect(page.getByText('Henri Score')).toBeVisible()
    await expect(page.getByText('"68"')).toBeVisible()

    // Verify Score Breakdown
    await expect(page.getByRole('heading', { name: 'Score Breakdown' })).toBeVisible()
    await expect(page.getByText('Snoring Isolation')).toBeVisible()
    await expect(page.getByText('35/35')).toBeVisible()
    await expect(page.getByText('Beach Access')).toBeVisible()
    await expect(page.getByText('15/15').first()).toBeVisible()
    await expect(page.getByText('Rating Quality')).toBeVisible()
  })

  test('Property #41 (Sharm Hills) has vetting report with Clear verdict', async ({ page }) => {
    await page.goto(`${BASE_URL}/property/41`)

    // Wait for vetting report
    await expect(page.getByText('Review Vetting')).toBeVisible({ timeout: 10000 })

    // Verify verdict
    await expect(page.getByText('Clear')).toBeVisible()
    await expect(page.getByText('No red flags found in reviews')).toBeVisible()

    // Verify vetting date
    await expect(page.getByText('17 Jan 2026')).toBeVisible()

    // Verify what was checked
    await expect(page.getByRole('heading', { name: 'What We Checked' })).toBeVisible()
    await expect(page.getByText('Noise complaints')).toBeVisible()
    await expect(page.getByText('Cleanliness issues')).toBeVisible()
    await expect(page.getByText('Pest reports')).toBeVisible()

    // Verify safety features section
    await expect(page.getByRole('heading', { name: 'Safety Features' })).toBeVisible()
  })

  test('Property #72 shows MOSQUITOES red flag', async ({ page }) => {
    await page.goto(`${BASE_URL}/property/72`)

    // Wait for vetting report
    await expect(page.getByText('Review Vetting')).toBeVisible({ timeout: 10000 })

    // Verify red flags verdict
    await expect(page.getByText('Red Flags')).toBeVisible()
    await expect(page.getByText('Significant concerns found')).toBeVisible()

    // Verify specific red flag
    await expect(page.getByText('MOSQUITOES')).toBeVisible()
  })

  test('Property #121 shows NOISE and CASINO red flags', async ({ page }) => {
    await page.goto(`${BASE_URL}/property/121`)

    // Wait for vetting report
    await expect(page.getByText('Review Vetting')).toBeVisible({ timeout: 10000 })

    // Verify red flags
    await expect(page.getByText('NOISE')).toBeVisible()
    await expect(page.getByText('CASINO')).toBeVisible()

    // Verify review evidence
    await expect(page.getByText('Behind casino, can be noisy')).toBeVisible()
  })

  test('Property #115 shows CLEANLINESS and MAINTENANCE red flags', async ({ page }) => {
    await page.goto(`${BASE_URL}/property/115`)

    // Wait for vetting report
    await expect(page.getByText('Review Vetting')).toBeVisible({ timeout: 10000 })

    // Verify red flags
    await expect(page.getByText('CLEANLINESS')).toBeVisible()
    await expect(page.getByText('MAINTENANCE')).toBeVisible()
  })

  test('Property #79 shows Minor Concerns verdict', async ({ page }) => {
    await page.goto(`${BASE_URL}/property/79`)

    // Wait for vetting report
    await expect(page.getByText('Review Vetting')).toBeVisible({ timeout: 10000 })

    // Verify concerns verdict
    await expect(page.getByText('Minor Concerns')).toBeVisible()
    await expect(page.getByText('Some issues noted but manageable')).toBeVisible()
  })

  test('Property #119 has both safety alarms', async ({ page }) => {
    await page.goto(`${BASE_URL}/property/119`)

    // Wait for vetting report
    await expect(page.getByText('Review Vetting')).toBeVisible({ timeout: 10000 })

    // Verify safety features show as present (green)
    await expect(page.getByText('Smoke alarm')).toBeVisible()
    await expect(page.getByText('CO alarm')).toBeVisible()

    // Verify it's marked as clear
    await expect(page.getByText('Clear')).toBeVisible()
  })

  test('Property #201 (Sunrise Remal) is All-Inclusive hotel', async ({ page }) => {
    await page.goto(`${BASE_URL}/property/201`)

    // Wait for content
    await expect(page.getByText('Score Breakdown')).toBeVisible({ timeout: 10000 })

    // Verify it's an All-Inclusive hotel
    await expect(page.getByText('Sunrise Remal Resort')).toBeVisible()
    await expect(page.getByText('All-Inclusive')).toBeVisible()
    await expect(page.getByText('9.4')).toBeVisible()

    // Verify vetting is clear
    await expect(page.getByText('Clear')).toBeVisible()
  })

  test('Property #202 (Pickalbatros) is Premium All-Inclusive', async ({ page }) => {
    await page.goto(`${BASE_URL}/property/202`)

    // Wait for content
    await expect(page.getByText('Score Breakdown')).toBeVisible({ timeout: 10000 })

    // Verify it's the premium hotel option
    await expect(page.getByText('Pickalbatros Royal Grand')).toBeVisible()
    await expect(page.getByText('All-Inclusive')).toBeVisible()

    // Verify vetting is clear
    await expect(page.getByText('Clear')).toBeVisible()
  })

  // Run through all properties to verify basic structure
  for (const property of PROPERTIES) {
    test(`Property #${property.id} loads with score breakdown and vetting`, async ({ page }) => {
      await page.goto(`${BASE_URL}/property/${property.id}`)

      // Wait for content
      await expect(page.getByText('Score Breakdown')).toBeVisible({ timeout: 10000 })

      // Verify score breakdown exists
      await expect(page.getByText('Snoring Isolation')).toBeVisible()
      await expect(page.getByText(property.snoring)).toBeVisible()

      // Verify vetting report exists
      await expect(page.getByText('Review Vetting')).toBeVisible()
      await expect(page.getByText('What We Checked')).toBeVisible()

      // Verify verdict matches expected
      await expect(page.getByText(property.verdict)).toBeVisible()

      // If has red flags, verify they're shown
      if (property.hasRedFlags && property.redFlag) {
        await expect(page.getByText(property.redFlag)).toBeVisible()
      }
    })
  }
})

test.describe('Navigation', () => {
  test('Can navigate from Rankings to Property detail and back', async ({ page }) => {
    await page.goto(`${BASE_URL}/rankings`)

    // Click on first property
    await page.getByText('Sharm Hills').first().click()

    // Verify we're on detail page
    await expect(page.getByRole('heading', { name: 'Sharm Hills' })).toBeVisible({ timeout: 10000 })

    // Go back to rankings
    await page.getByRole('link', { name: 'Back to Rankings' }).click()
    await expect(page.getByRole('heading', { name: 'Property Rankings' })).toBeVisible()
  })
})
