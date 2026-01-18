import { createFileRoute } from '@tanstack/react-router'
import {
  FileSearch,
  Check,
  X,
  AlertTriangle,
  BedDouble,
  DoorClosed,
  Euro,
  Star,
  MapPin,
  Clock,
  Ruler,
  Building2,
  ExternalLink,
} from 'lucide-react'

export const Route = createFileRoute('/findings')({
  component: FindingsPage,
})

interface PropertyCardProps {
  rank: number
  name: string
  room: string
  price: string
  size?: string
  rating: string
  reviews: string
  location: string
  bedroom1: string
  bedroom2: string
  highlight?: string
  url: string
  verified: boolean
}

function PropertyCard({
  rank,
  name,
  room,
  price,
  size,
  rating,
  reviews,
  location,
  bedroom1,
  bedroom2,
  highlight,
  url,
  verified,
}: PropertyCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400">
            #{rank}
          </span>
          <div>
            <h3 className="font-semibold text-white">{name}</h3>
            <p className="text-xs text-slate-400">{room}</p>
          </div>
        </div>
        {verified && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">
            <Check className="h-3 w-3" />
            Verified 2BR
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {highlight && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {highlight}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Euro className="h-4 w-4 text-amber-400" />
            <span className="font-medium text-white">{price}</span>
            <span className="text-slate-500">AI</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Star className="h-4 w-4 text-amber-400" />
            <span className="font-medium text-white">{rating}</span>
            <span className="text-slate-500">({reviews})</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="h-4 w-4 text-slate-500" />
            {location}
          </div>
          {size && (
            <div className="flex items-center gap-2 text-slate-300">
              <Ruler className="h-4 w-4 text-slate-500" />
              {size}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
            Bedroom Configuration
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-xs text-slate-500">Bedroom 1</p>
              <p className="text-sm text-white">{bedroom1}</p>
            </div>
            <div className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-xs text-slate-500">Bedroom 2</p>
              <p className="text-sm text-white">{bedroom2}</p>
            </div>
          </div>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/20 transition-colors"
        >
          View on Booking.com
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

function RejectedProperty({ name, reason }: { name: string; reason: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <X className="h-5 w-5 text-rose-400" />
        <span className="text-white">{name}</span>
      </div>
      <span className="text-sm text-slate-400">{reason}</span>
    </div>
  )
}

function FindingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          <FileSearch className="h-4 w-4" />
          4 Properties Verified
        </div>
        <h1 className="text-3xl font-bold text-white">
          2-Bedroom Verification Report
        </h1>
        <p className="mt-2 text-slate-400">
          Properties with TRUE separate bedrooms for snoring isolation
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">4</p>
          <p className="text-xs text-slate-400">Verified 2BR</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">1</p>
          <p className="text-xs text-slate-400">With Lockable Door</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-3xl font-bold text-white">75m²</p>
          <p className="text-xs text-slate-400">Largest Suite</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">€1,620</p>
          <p className="text-xs text-slate-400">Best Value AI</p>
        </div>
      </div>

      {/* Key Finding */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <DoorClosed className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Key Finding: Lockable Door
            </h2>
            <p className="mt-2 text-slate-300">
              Only <strong className="text-amber-200">Sunrise Arabian Beach Family Suite</strong> explicitly mentions a{' '}
              <strong className="text-amber-200">"lockable door"</strong> between bedrooms.
              This is the best option for guaranteed snoring isolation.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Other properties have separate bedrooms but don't specify lockable doors in their descriptions.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Properties */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Check className="h-5 w-5 text-emerald-400" />
          Verified 2-Bedroom Properties
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <PropertyCard
            rank={1}
            name="Sunrise Arabian Beach"
            room="Family Suite"
            price="€1,620-€1,800"
            size="53m²"
            rating="9.4"
            reviews="5,045"
            location="Sharks Bay (Beachfront)"
            bedroom1="1 King bed"
            bedroom2="2 Double beds"
            highlight="LOCKABLE DOOR between bedrooms - guaranteed snoring isolation!"
            url="https://www.booking.com/hotel/eg/sunrise-arabian-beach-resort.html"
            verified
          />

          <PropertyCard
            rank={2}
            name="White Hills Resort"
            room="Family Suite"
            price="€2,147-€2,385"
            size="60m²"
            rating="9.3"
            reviews="5,490"
            location="950m from beach"
            bedroom1="2 Twin beds"
            bedroom2="1 King bed"
            highlight="Highest review count (5,490) - very reliable data"
            url="https://www.booking.com/hotel/eg/white-hills-resort.html"
            verified
          />

          <PropertyCard
            rank={3}
            name="Sunrise Remal Beach"
            room="Family Suite"
            price="€2,391"
            size="75m²"
            rating="9.4"
            reviews="~500"
            location="Sharks Bay area"
            bedroom1="1 King bed"
            bedroom2="2 Twin beds"
            highlight="Largest suite (75m²) - most space between bedrooms"
            url="https://www.booking.com/hotel/eg/melia-sinai.html"
            verified
          />

          <PropertyCard
            rank={4}
            name="Royal Savoy"
            room="Two-Bedroom Suite"
            price="€3,424-€3,907"
            rating="9.3"
            reviews="1,500"
            location="Sharks Bay (100m to beach)"
            bedroom1="1 Queen bed"
            bedroom2="2 Full beds"
            highlight="Luxury 5-star with private beach - premium option"
            url="https://www.booking.com/hotel/eg/royal-savoy.html"
            verified
          />
        </div>
      </section>

      {/* Rejected Properties */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <X className="h-5 w-5 text-rose-400" />
          Properties Without 2BR Options
        </h2>
        <div className="space-y-2">
          <RejectedProperty
            name="Baron Palms"
            reason="Adults-only boutique hotel (16+) - only standard rooms"
          />
          <RejectedProperty
            name="Stella Di Mare"
            reason="URL returning 404 - needs manual verification"
          />
          <RejectedProperty
            name="DoubleTree Hilton Sharks Bay"
            reason="URL returning 404 - search shows standard rooms only"
          />
        </div>
      </section>

      {/* Methodology */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <FileSearch className="h-5 w-5 text-slate-400" />
          Verification Methodology
        </h2>
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            Each property was verified using Playwright browser automation to capture:
          </p>
          <ul className="space-y-1 ml-4">
            <li>• Full-page screenshots of room listings</li>
            <li>• Accessibility snapshots with structured room data</li>
            <li>• Price verification for Feb 15-22, 2026 dates</li>
          </ul>
          <p className="mt-4">
            <strong className="text-white">TRUE 2-Bedroom criteria:</strong>
          </p>
          <ul className="space-y-1 ml-4">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Room description explicitly mentions "2 bedrooms"
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Bedroom 1 and Bedroom 2 listed separately with bed configurations
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Physical separation (not just 2 beds in same room)
            </li>
          </ul>
        </div>
      </section>

      {/* Recommendation */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6">
        <h2 className="text-lg font-semibold text-emerald-300">
          Recommendation
        </h2>
        <p className="mt-2 text-slate-300">
          For guaranteed snoring isolation, book{' '}
          <strong className="text-white">Sunrise Arabian Beach Family Suite</strong> at{' '}
          <strong className="text-emerald-400">€1,620-€1,800</strong> All-Inclusive.
          It's the only property that explicitly mentions a{' '}
          <strong className="text-amber-200">lockable door</strong> between bedrooms,
          and offers the best value among verified 2BR options.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://www.booking.com/hotel/eg/sunrise-arabian-beach-resort.html?checkin=2026-02-15&checkout=2026-02-22&group_adults=2&no_rooms=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            Book Sunrise Arabian
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-center text-xs text-slate-500">
        Last verified: January 18, 2026 | Prices valid for Feb 15-22, 2026
      </p>
    </div>
  )
}
