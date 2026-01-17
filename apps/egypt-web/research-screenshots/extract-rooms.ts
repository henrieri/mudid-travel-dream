#!/usr/bin/env npx tsx

/**
 * Extract room options from Booking.com accessibility snapshot (.md) files
 *
 * Usage: npx tsx extract-rooms.ts [path-to-snapshot.md]
 *
 * Extracts:
 * - Room name
 * - Bed configuration
 * - Size (m²)
 * - All prices with meal plans
 * - Key amenities
 * - 2BR indicator
 */

import * as fs from 'fs'
import * as path from 'path'

interface PriceOption {
  price: string
  discountedPrice?: string
  mealPlan: string
  cancellation?: string
}

interface RoomOption {
  name: string
  beds: string[]
  size?: string
  amenities: string[]
  description?: string
  has2BR: boolean
  priceOptions: PriceOption[]
}

function extractRooms(content: string): RoomOption[] {
  const rooms: RoomOption[] = []

  // Split content into lines for easier processing
  const lines = content.split('\n')

  // Find all rowheader lines (room definitions)
  const roomHeaderPattern = /rowheader\s+"([^"]+)"\s+\[ref=/
  const priceRowPattern = /row\s+"[^"]*(?:All-Inclusive|breakfast|Includes taxes)[^"]*"\s+\[ref=/i

  let currentRoom: RoomOption | null = null
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Check for room header
    const headerMatch = line.match(roomHeaderPattern)
    if (headerMatch) {
      const fullText = headerMatch[1]

      // Skip column headers
      if (fullText.includes('Room type') || fullText.includes('Select amount')) {
        i++
        continue
      }

      // Save previous room if exists
      if (currentRoom) {
        rooms.push(currentRoom)
      }

      // Extract room name (text before common patterns)
      const nameMatch = fullText.match(/^([^0-9]+?)(?:\s+(?:We have|Select your bed|Bedroom|\d+\s*m²))/i)
      const name = nameMatch
        ? nameMatch[1].trim()
        : fullText.split(/\s+(?:We have|Select|Bedroom|\d+\s*m²)/i)[0].trim()

      // Extract beds
      const beds: string[] = []

      // Look for "Bedroom N: X bed" patterns
      const bedroomPattern = /Bedroom\s+(\d+):\s+(\d+\s+(?:king|queen|twin|full|double|single)\s+bed(?:s)?)/gi
      let bedMatch
      while ((bedMatch = bedroomPattern.exec(fullText)) !== null) {
        beds.push(`Bedroom ${bedMatch[1]}: ${bedMatch[2]}`)
      }

      // If no bedroom pattern, look for simple bed info
      if (beds.length === 0) {
        const simpleBedPatterns = [
          /(\d+\s+(?:king|queen|twin|full|double|single)\s+bed(?:s)?)/gi,
          /(\d+\s+(?:large\s+)?(?:double|single)\s+bed(?:s)?)/gi,
        ]
        for (const pattern of simpleBedPatterns) {
          let match
          while ((match = pattern.exec(fullText)) !== null) {
            if (!beds.includes(match[1])) {
              beds.push(match[1])
            }
          }
        }
      }

      // Extract size
      const sizeMatch = fullText.match(/(\d+)\s*m²/)
      const size = sizeMatch ? `${sizeMatch[1]}m²` : undefined

      // Extract amenities from the full text
      const amenities: string[] = []
      const amenityPatterns = [
        /Balcony/i,
        /Terrace/i,
        /Sea view/i,
        /Pool view/i,
        /Garden view/i,
        /Air conditioning/i,
        /Flat-screen TV/i,
        /Free Wifi/i,
        /Minibar/i,
        /Private pool/i,
        /Private suite/i,
        /Entire villa/i,
        /Kitchen/i,
        /Spa bath/i,
        /Hot tub/i,
        /Jacuzzi/i,
        /Beachfront/i,
      ]
      for (const pattern of amenityPatterns) {
        if (pattern.test(fullText)) {
          const match = fullText.match(pattern)
          if (match && !amenities.includes(match[0])) {
            amenities.push(match[0])
          }
        }
      }

      // Check for 2 bedrooms
      const has2BR =
        /Bedroom\s+2:/i.test(fullText) ||
        /2\s*bedroom/i.test(fullText) ||
        /two.bedroom/i.test(fullText) ||
        /second bedroom/i.test(fullText) ||
        beds.some((b) => b.includes('Bedroom 2'))

      // Extract description
      const descMatch = fullText.match(
        /(?:This|Featuring|Boasting|A\s|Deluxe|Spacious|Large)[^.]+\./i
      )
      const description = descMatch ? descMatch[0] : undefined

      currentRoom = {
        name: name.replace(/\s+/g, ' ').trim().substring(0, 60),
        beds,
        size,
        amenities,
        description,
        has2BR,
        priceOptions: [],
      }
    }

    // Check for price rows (after we have a room)
    if (currentRoom) {
      // Look for price in the next ~100 lines until next rowheader
      const priceMatch = line.match(/€\s*([\d,]+)/)
      const mealMatch = line.match(
        /(All-Inclusive|(?:Wonderful|Superb|Very good)?\s*breakfast\s*(?:included)?|Half board|Full board)/i
      )

      if (priceMatch && mealMatch) {
        // Check if this price option already exists
        const price = `€${priceMatch[1]}`
        const mealPlan = mealMatch[1].trim()

        const exists = currentRoom.priceOptions.some(
          (p) => p.price === price && p.mealPlan === mealPlan
        )

        if (!exists) {
          // Look for discounted price nearby
          const discountMatch = line.match(
            /Original price €\s*([\d,]+)\s*Current price €\s*([\d,]+)/i
          )
          const discountedPrice = discountMatch ? `€${discountMatch[2]}` : undefined

          // Look for cancellation
          const cancelMatch = line.match(/Free cancellation before ([^"]+)/i)
          const cancellation = cancelMatch ? `Free cancellation before ${cancelMatch[1]}` : undefined

          currentRoom.priceOptions.push({
            price,
            discountedPrice,
            mealPlan,
            cancellation,
          })
        }
      }

      // Also extract prices from cell elements
      const cellPriceMatch = line.match(/generic\s+\[ref=[^\]]+\]:\s*€\s*([\d,]+)/)
      if (cellPriceMatch) {
        const price = `€${cellPriceMatch[1]}`
        // Look ahead for meal plan
        for (let j = i; j < Math.min(i + 30, lines.length); j++) {
          const mealLine = lines[j]
          const mealInCell = mealLine.match(
            /(All-Inclusive|(?:Wonderful|Superb)?\s*breakfast\s*(?:included)?)/i
          )
          if (mealInCell) {
            const mealPlan = mealInCell[1].trim()
            const exists = currentRoom.priceOptions.some(
              (p) => p.price === price && p.mealPlan === mealPlan
            )
            if (!exists) {
              currentRoom.priceOptions.push({
                price,
                mealPlan,
              })
            }
            break
          }
        }
      }
    }

    i++
  }

  // Don't forget the last room
  if (currentRoom) {
    rooms.push(currentRoom)
  }

  // Deduplicate rooms by name and merge price options
  const roomMap = new Map<string, RoomOption>()
  for (const room of rooms) {
    const existing = roomMap.get(room.name)
    if (existing) {
      // Merge price options
      for (const po of room.priceOptions) {
        const exists = existing.priceOptions.some(
          (p) => p.price === po.price && p.mealPlan === po.mealPlan
        )
        if (!exists) {
          existing.priceOptions.push(po)
        }
      }
    } else {
      roomMap.set(room.name, room)
    }
  }

  return Array.from(roomMap.values())
}

function formatOutput(rooms: RoomOption[], propertyName: string): string {
  let output = `# Room Options: ${propertyName}\n\n`

  // Summary table
  output += '## Summary\n\n'
  output += '| Room | Size | Beds | 2BR | Prices |\n'
  output += '|------|------|------|-----|--------|\n'

  for (const room of rooms) {
    const bedsStr = room.beds.length > 0 ? room.beds.slice(0, 2).join(', ') : '-'
    const pricesStr =
      room.priceOptions.length > 0
        ? room.priceOptions.map((p) => `${p.price} (${p.mealPlan})`).join('<br>')
        : '-'
    output += `| ${room.name.substring(0, 35)} | ${room.size || '-'} | ${bedsStr.substring(0, 30)} | ${room.has2BR ? '✅' : '❌'} | ${pricesStr} |\n`
  }

  // 2BR Options highlight
  const twoBedroomRooms = rooms.filter((r) => r.has2BR)
  if (twoBedroomRooms.length > 0) {
    output += '\n## 🎉 2-Bedroom Options Found!\n\n'
    for (const room of twoBedroomRooms) {
      output += `### ${room.name}\n`
      output += `- **Beds**: ${room.beds.join(' | ') || 'See description'}\n`
      if (room.size) output += `- **Size**: ${room.size}\n`
      if (room.amenities.length > 0) output += `- **Amenities**: ${room.amenities.join(', ')}\n`
      if (room.description) output += `- **Description**: ${room.description}\n`
      if (room.priceOptions.length > 0) {
        output += '- **Prices**:\n'
        for (const po of room.priceOptions) {
          const priceStr = po.discountedPrice
            ? `~~${po.price}~~ ${po.discountedPrice}`
            : po.price
          output += `  - ${priceStr} - ${po.mealPlan}\n`
        }
      }
      output += '\n'
    }
  } else {
    output += '\n## ❌ No 2-Bedroom Options Found\n'
  }

  // All Room Details as JSON
  output += '\n## All Room Details\n\n'
  output += '```json\n'
  output += JSON.stringify(rooms, null, 2)
  output += '\n```\n'

  return output
}

// Main
const args = process.argv.slice(2)
if (args.length === 0) {
  // Default: process all .md files in current directory subdirectories
  const baseDir = path.dirname(new URL(import.meta.url).pathname)
  const subdirs = fs
    .readdirSync(baseDir)
    .filter((f) => {
      const fullPath = path.join(baseDir, f)
      return fs.statSync(fullPath).isDirectory() && !f.startsWith('.')
    })
    .sort()

  console.log('Processing all property snapshots...\n')

  for (const subdir of subdirs) {
    const mdFiles = fs.readdirSync(path.join(baseDir, subdir)).filter((f) => f.endsWith('.md') && !f.startsWith('extracted'))
    for (const mdFile of mdFiles) {
      const filePath = path.join(baseDir, subdir, mdFile)
      console.log(`\n${'='.repeat(60)}`)
      console.log(`Processing: ${subdir}/${mdFile}`)
      console.log('='.repeat(60))

      const content = fs.readFileSync(filePath, 'utf-8')
      const rooms = extractRooms(content)

      if (rooms.length > 0) {
        const propertyName = subdir.replace(/^\d+-/, '').replace(/-/g, ' ')
        const output = formatOutput(rooms, propertyName)
        console.log(output)

        // Save extracted data
        const outputPath = path.join(baseDir, subdir, 'extracted-rooms.md')
        fs.writeFileSync(outputPath, output)
        console.log(`Saved to: ${outputPath}`)
      } else {
        console.log('No room options found in this file.')
      }
    }
  }
} else {
  // Process specific file
  const filePath = args[0]
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const rooms = extractRooms(content)

  if (rooms.length > 0) {
    const output = formatOutput(rooms, path.basename(filePath, '.md'))
    console.log(output)
  } else {
    console.log('No room options found.')
  }
}
