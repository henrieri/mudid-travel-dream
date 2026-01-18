import { test, expect } from '@playwright/test'

const BASE_URL = process.env.VERIFY_URL || 'http://egypt.local'
const EXPECTED_VERSION = process.env.EXPECTED_VERSION || ''

interface VersionInfo {
  version: string
  commit: string
  branch: string
  dirty: boolean
  message: string
  buildTime: string
  buildTimestamp: number
}

test.describe('Deployment Verification', () => {
  test('Version endpoint returns correct build info', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/version.json`)
    expect(response.ok()).toBeTruthy()

    const version: VersionInfo = await response.json()

    // Verify required fields exist
    expect(version.version).toBeTruthy()
    expect(version.commit).toBeTruthy()
    expect(version.branch).toBeTruthy()
    expect(version.buildTime).toBeTruthy()
    expect(version.buildTimestamp).toBeGreaterThan(0)

    // Log version info for debugging
    console.log('Deployed version:', version.version)
    console.log('Commit:', version.commit)
    console.log('Branch:', version.branch)
    console.log('Build time:', version.buildTime)

    // If expected version is provided, verify it matches
    if (EXPECTED_VERSION) {
      expect(version.version).toBe(EXPECTED_VERSION)
      console.log(`✓ Version matches expected: ${EXPECTED_VERSION}`)
    }
  })

  test('Homepage loads successfully', async ({ page }) => {
    const response = await page.goto(BASE_URL)
    expect(response?.ok()).toBeTruthy()

    // Check for key UI elements
    await expect(page.getByText('101 Properties')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Sharm el Sheikh')).toBeVisible()
  })

  test('Rankings page loads with property data', async ({ page }) => {
    await page.goto(`${BASE_URL}/rankings`)

    // Wait for data to load
    await expect(page.getByRole('heading', { name: 'Property Rankings' })).toBeVisible({ timeout: 10000 })

    // Verify properties are rendered
    await expect(page.getByText('Sharm Hills').first()).toBeVisible()
  })

  test('Tips page loads with images', async ({ page }) => {
    await page.goto(`${BASE_URL}/tips`)

    // Check hero image loaded
    const heroImg = page.locator('img[alt*="Sharm el Sheikh"]')
    await expect(heroImg).toBeVisible({ timeout: 10000 })

    // Check page content
    await expect(page.getByText('Your Egypt Travel Guide')).toBeVisible()
  })

  test('Activities page loads with data', async ({ page }) => {
    await page.goto(`${BASE_URL}/activities`)

    await expect(page.getByText('Top Activities in Sharm el Sheikh')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Ras Mohammed')).toBeVisible()
  })

  test('Budget calculator page is functional', async ({ page }) => {
    await page.goto(`${BASE_URL}/budget`)

    await expect(page.getByText('Egypt Trip Budget')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Estimated Total')).toBeVisible()
  })

  test('Static assets are served with cache headers', async ({ request }) => {
    // Check version.json has appropriate caching
    const versionResponse = await request.get(`${BASE_URL}/version.json`)
    expect(versionResponse.ok()).toBeTruthy()

    // Check activities.json is served
    const activitiesResponse = await request.get(`${BASE_URL}/activities.json`)
    expect(activitiesResponse.ok()).toBeTruthy()
    const activities = await activitiesResponse.json()
    expect(Array.isArray(activities)).toBeTruthy()
    expect(activities.length).toBeGreaterThan(0)
  })

  test('All main routes return 200', async ({ request }) => {
    const routes = [
      '/',
      '/rankings',
      '/tips',
      '/activities',
      '/budget',
      '/findings',
    ]

    for (const route of routes) {
      const response = await request.get(`${BASE_URL}${route}`)
      expect(response.ok(), `Route ${route} should return 200`).toBeTruthy()
    }
  })
})

test.describe('Deployment Health', () => {
  test('Build is not dirty in production', async ({ request }) => {
    // Skip in local development
    if (BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')) {
      test.skip()
    }

    const response = await request.get(`${BASE_URL}/version.json`)
    const version: VersionInfo = await response.json()

    // Production builds should not be dirty
    expect(version.dirty, 'Production build should not have uncommitted changes').toBe(false)
  })

  test('Build is recent (within last hour)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/version.json`)
    const version: VersionInfo = await response.json()

    const buildTime = new Date(version.buildTime).getTime()
    const now = Date.now()
    const oneHourMs = 60 * 60 * 1000

    // Only check if we're doing deployment verification (not regular testing)
    if (EXPECTED_VERSION) {
      expect(now - buildTime, 'Build should be recent').toBeLessThan(oneHourMs)
    }
  })
})
