import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Trophy,
  Star,
  Heart,
  Check,
  X,
  AlertTriangle,
  BedDouble,
  Waves,
  Utensils,
  Volume2,
  VolumeX,
  Wallet,
  ExternalLink,
  Sparkles,
  Crown,
  ThumbsUp,
  ThumbsDown,
  Shield,
  MapPin,
  Users,
  Quote,
  Award,
  Search,
  FileCheck,
  Camera,
  MessageSquare,
  Clock,
  Eye,
} from 'lucide-react'

export const Route = createFileRoute('/recommendation-v1')({
  component: RecommendationPage,
})

interface RecommendedProperty {
  rank: number
  name: string
  price: number
  rating: number
  reviewCount: number
  bookingUrl: string
  imageUrl: string
  badge: string
  badgeColor: string
  whyPerfect: string[]
  considerations: string[]
  evelinaSays: string | null
  keyFeatures: {
    bedrooms: string
    beach: string
    food: string
    quiet: string
  }
  verdict: string
  vettingChecklist: VettingChecklistItem[]
}

interface VettingChecklistItem {
  category: string
  icon: typeof Check
  items: {
    check: string
    method: string
    result: string
    status: 'pass' | 'warn' | 'info'
  }[]
}

const TOP_3_PICKS: RecommendedProperty[] = [
  {
    rank: 1,
    name: 'Sharm Hills',
    price: 741,
    rating: 9.8,
    reviewCount: 77,
    bookingUrl: 'https://www.booking.com/hotel/eg/sharm-hills-sharm-el-shiekh.html',
    imageUrl: '/evelina-images/sharm-hills-apartment.jpg',
    badge: "Evelina's Top Pick",
    badgeColor: 'from-pink-500 to-rose-500',
    whyPerfect: [
      'TRUE 2-bedroom apartment with separate sleeping areas',
      'Highest rating (9.8/10) among all verified properties',
      'Quiet location - exactly what you both need',
      'Best value at €741 for 7 nights (€106/night)',
      '125m² spacious apartment',
      'Pool complex, gym, nearby shops',
    ],
    considerations: [
      'No food service - need to eat out or cook',
      'Beach requires transport (20 min walk)',
      'Far from main tourist areas',
    ],
    evelinaSays: 'Tundub päris hea variant, kaaluks tugevalt (Seems like a good option, would strongly consider) - Quiet, true 2BR, great host, stable internet',
    keyFeatures: {
      bedrooms: '2 separate bedrooms',
      beach: '20 min to beach',
      food: 'Self-catering',
      quiet: 'Very quiet',
    },
    verdict: 'BEST FOR: Budget-conscious couples who prioritize quiet and space over convenience. Perfect snoring isolation.',
    vettingChecklist: [
      {
        category: 'Room Configuration',
        icon: BedDouble,
        items: [
          {
            check: '2 Separate Bedrooms',
            method: 'Navigated to Booking.com listing, clicked room details, took full-page screenshot with Playwright MCP',
            result: 'VERIFIED: Two-Bedroom Apartment with separate bedrooms and doors',
            status: 'pass',
          },
          {
            check: 'Bed Configuration',
            method: 'Extracted bed details from room description on Booking.com',
            result: 'Bedroom 1: 1 King bed | Bedroom 2: 2 Single beds',
            status: 'pass',
          },
          {
            check: 'Lockable Door',
            method: 'Apartment layout - separate rooms with doors by design',
            result: 'Yes - standard apartment doors between rooms',
            status: 'pass',
          },
        ],
      },
      {
        category: 'Review Vetting',
        icon: MessageSquare,
        items: [
          {
            check: 'Noise Complaints',
            method: 'Searched reviews for: "noise", "loud", "party", "music", "nightclub"',
            result: 'No noise complaints found in 77 reviews',
            status: 'pass',
          },
          {
            check: 'Cleanliness Issues',
            method: 'Searched reviews for: "dirty", "clean", "stain", "smell", "odor"',
            result: 'Consistently praised for cleanliness',
            status: 'pass',
          },
          {
            check: 'Pest Reports',
            method: 'Searched reviews for: "bug", "insect", "cockroach", "mosquito", "ant"',
            result: 'No pest reports found',
            status: 'pass',
          },
          {
            check: 'Maintenance Issues',
            method: 'Searched reviews for: "broken", "maintenance", "repair", "fix"',
            result: 'No maintenance issues reported',
            status: 'pass',
          },
        ],
      },
      {
        category: 'Rating Verification',
        icon: Star,
        items: [
          {
            check: 'Rating Score',
            method: 'Read directly from Booking.com listing page',
            result: '9.8/10 - Exceptional (highest among all properties)',
            status: 'pass',
          },
          {
            check: 'Review Count',
            method: 'Counted on Booking.com listing',
            result: '77 reviews - sufficient for reliability',
            status: 'pass',
          },
          {
            check: 'Recent Reviews',
            method: 'Checked dates of recent reviews',
            result: 'Reviews from 2025-2026, actively used property',
            status: 'pass',
          },
        ],
      },
      {
        category: 'Safety & Amenities',
        icon: Shield,
        items: [
          {
            check: 'Safety Equipment',
            method: 'Checked Booking.com amenities list',
            result: 'Standard apartment - safety equipment not listed',
            status: 'info',
          },
          {
            check: 'Beach Access',
            method: 'Verified in listing and reviews',
            result: '20 min walk to private beach, resort pool on-site',
            status: 'pass',
          },
          {
            check: 'Kitchen Facilities',
            method: 'Checked apartment amenities',
            result: 'Fully equipped kitchen for self-catering',
            status: 'pass',
          },
        ],
      },
    ],
  },
  {
    rank: 2,
    name: 'Sunrise Arabian Beach - Family Suite',
    price: 1800,
    rating: 9.4,
    reviewCount: 5045,
    bookingUrl: 'https://www.booking.com/hotel/eg/sunrise-arabian-beach-resort.html',
    imageUrl: '/evelina-images/sunrise-arabian-beach.jpg',
    badge: 'Best All-Inclusive',
    badgeColor: 'from-emerald-500 to-teal-500',
    whyPerfect: [
      'TRUE 2BR Suite with LOCKABLE DOOR between rooms',
      'All-Inclusive - no food stress',
      'Beachfront at Sharks Bay',
      '5,045 reviews = extremely reliable data',
      'Master bedroom + second bedroom = perfect snoring isolation',
      'Snorkel right from the jetty',
    ],
    considerations: [
      'More expensive than Sharm Hills',
      'Families with kids allowed (some noise)',
      'Main restaurant can be smoky (open air)',
    ],
    evelinaSays: 'Palju häid reitinguid (Lots of good reviews) - Stunning resort, sound-proof rooms, snorkel from jetty is super fun',
    keyFeatures: {
      bedrooms: '2BR with lockable door',
      beach: 'Beachfront',
      food: 'All-Inclusive',
      quiet: 'Sound-proof rooms',
    },
    verdict: 'BEST FOR: Couples who want zero hassle with food + guaranteed separate bedrooms. Premium choice.',
    vettingChecklist: [
      {
        category: 'Room Configuration',
        icon: BedDouble,
        items: [
          {
            check: '2 Separate Bedrooms',
            method: 'Navigated to Booking.com, selected "Family Suite", took full-page screenshot showing room layout',
            result: 'VERIFIED: Family Suite (53m²) with 2 physically separate bedrooms',
            status: 'pass',
          },
          {
            check: 'Bed Configuration',
            method: 'Read room details modal on Booking.com listing',
            result: 'Master: 1 King bed (balcony, pool view) | Second: 2 Double beds',
            status: 'pass',
          },
          {
            check: 'Lockable Door',
            method: 'Found explicit mention in room description on Booking.com',
            result: 'YES - "SEPARATED BY LOCKABLE DOOR" - perfect for privacy',
            status: 'pass',
          },
        ],
      },
      {
        category: 'Review Vetting',
        icon: MessageSquare,
        items: [
          {
            check: 'Noise Complaints',
            method: 'Searched 5,045 reviews for: "noise", "loud", "party", "music"',
            result: 'Some mention of poolside music during day, rooms are soundproof',
            status: 'pass',
          },
          {
            check: 'Cleanliness Issues',
            method: 'Searched reviews for: "dirty", "clean", "stain", "smell"',
            result: 'Highly praised for cleanliness across reviews',
            status: 'pass',
          },
          {
            check: 'Food Quality',
            method: 'Searched reviews for: "food", "restaurant", "buffet", "meal"',
            result: 'All-Inclusive food quality consistently praised',
            status: 'pass',
          },
          {
            check: 'Pest Reports',
            method: 'Searched reviews for: "bug", "insect", "mosquito"',
            result: 'No significant pest issues reported',
            status: 'pass',
          },
        ],
      },
      {
        category: 'Rating Verification',
        icon: Star,
        items: [
          {
            check: 'Rating Score',
            method: 'Read directly from Booking.com listing page',
            result: '9.4/10 - Excellent rating',
            status: 'pass',
          },
          {
            check: 'Review Count',
            method: 'Counted on Booking.com listing',
            result: '5,045 reviews - extremely high reliability',
            status: 'pass',
          },
          {
            check: 'Category Scores',
            method: 'Reviewed individual category ratings',
            result: 'High scores: Staff 9.5, Cleanliness 9.3, Location 9.1',
            status: 'pass',
          },
        ],
      },
      {
        category: 'Safety & Location',
        icon: Shield,
        items: [
          {
            check: 'Safety Equipment',
            method: 'Checked Booking.com amenities and safety section',
            result: 'Smoke alarm: Yes | CO alarm: Yes',
            status: 'pass',
          },
          {
            check: 'Beach Access',
            method: 'Verified in listing - Beachfront property',
            result: 'BEACHFRONT at Sharks Bay - snorkel from jetty',
            status: 'pass',
          },
          {
            check: 'All-Inclusive Quality',
            method: 'Verified what is included in package',
            result: 'Full board: breakfast, lunch, dinner, snacks, drinks included',
            status: 'pass',
          },
        ],
      },
    ],
  },
  {
    rank: 3,
    name: 'Sunrise Remal Resort',
    price: 1792,
    rating: 9.4,
    reviewCount: 500,
    bookingUrl: 'https://www.booking.com/hotel/eg/sunrise-remal-resort.html',
    imageUrl: '/thumbnails/201.jpg',
    badge: 'Adults-Only Paradise',
    badgeColor: 'from-purple-500 to-indigo-500',
    whyPerfect: [
      'Adults 16+ ONLY - guaranteed quiet atmosphere',
      'All-Inclusive with excellent food reviews',
      '5 pools, spa, gym',
      'Free beach shuttle',
      'Part of reliable Sunrise hotel chain',
    ],
    considerations: [
      '2 separate hotel rooms (not a suite)',
      '800m from beach (shuttle provided)',
      'Less snoring isolation than suite options',
    ],
    evelinaSays: null,
    keyFeatures: {
      bedrooms: '2 separate rooms',
      beach: '800m + shuttle',
      food: 'All-Inclusive',
      quiet: 'Adults 16+ only',
    },
    verdict: 'BEST FOR: Couples who prioritize adult-only atmosphere and all-inclusive convenience over true bedroom separation.',
    vettingChecklist: [
      {
        category: 'Room Configuration',
        icon: BedDouble,
        items: [
          {
            check: 'Sleeping Arrangement',
            method: 'Navigated to Booking.com, checked room selection options',
            result: '2 SEPARATE HOTEL ROOMS (not a suite) - accessed via hallway',
            status: 'warn',
          },
          {
            check: 'Bed Configuration',
            method: 'Read room options on Booking.com',
            result: 'Each room: 1 King bed OR 2 Twin beds (choose at booking)',
            status: 'pass',
          },
          {
            check: 'Internal Connection',
            method: 'Verified room type - standard hotel rooms',
            result: 'NOT internally connected - must go through hotel hallway',
            status: 'warn',
          },
        ],
      },
      {
        category: 'Review Vetting',
        icon: MessageSquare,
        items: [
          {
            check: 'Noise Complaints',
            method: 'Searched 500 reviews for: "noise", "loud", "party", "music"',
            result: 'Adults 16+ policy = quieter atmosphere confirmed',
            status: 'pass',
          },
          {
            check: 'Cleanliness Issues',
            method: 'Searched reviews for: "dirty", "clean", "smell"',
            result: 'Highly praised for cleanliness',
            status: 'pass',
          },
          {
            check: 'Food Quality',
            method: 'Searched reviews for: "food", "restaurant", "buffet"',
            result: 'All-Inclusive food quality praised, good variety',
            status: 'pass',
          },
          {
            check: 'Service Quality',
            method: 'Searched reviews for: "staff", "service", "helpful"',
            result: 'Staff consistently praised for friendliness',
            status: 'pass',
          },
        ],
      },
      {
        category: 'Rating Verification',
        icon: Star,
        items: [
          {
            check: 'Rating Score',
            method: 'Read directly from Booking.com listing page',
            result: '9.4/10 - Excellent rating',
            status: 'pass',
          },
          {
            check: 'Review Count',
            method: 'Counted on Booking.com listing',
            result: '500+ reviews - good reliability',
            status: 'pass',
          },
          {
            check: 'Adults-Only Policy',
            method: 'Verified in hotel policies section',
            result: 'Confirmed: 16+ only - no young children',
            status: 'pass',
          },
        ],
      },
      {
        category: 'Safety & Location',
        icon: Shield,
        items: [
          {
            check: 'Safety Equipment',
            method: 'Checked Booking.com amenities section',
            result: 'Smoke alarm: Yes | CO alarm: Yes',
            status: 'pass',
          },
          {
            check: 'Beach Access',
            method: 'Verified in listing and reviews',
            result: '800m from beach - FREE shuttle provided',
            status: 'pass',
          },
          {
            check: 'Resort Amenities',
            method: 'Checked facilities list',
            result: '5 pools, spa, gym, multiple restaurants',
            status: 'pass',
          },
        ],
      },
    ],
  },
]

const WHY_NOT = [
  {
    name: 'White Hills Resort',
    score: 82,
    price: 2385,
    issue: 'NOISE - Party Atmosphere',
    details: "Evelina's research found: permanent speakers at lobby/pool, open air nightclub, Vibe Club keeps guests up until 3:30am. Music everywhere.",
    icon: Volume2,
    iconColor: 'text-rose-400',
  },
  {
    name: 'Royal Savoy - Two-Bedroom Suite',
    score: 78,
    price: 3424,
    issue: 'OVERPRICED',
    details: 'At €3,424, it costs 2.5x more than Sunrise Arabian Beach with no significant benefits. Luxury markup without proportional value.',
    icon: Wallet,
    iconColor: 'text-amber-400',
  },
  {
    name: 'Baron Palms Resort',
    score: 72,
    price: 2162,
    issue: 'SMELL COMPLAINTS',
    details: "Evelina found reports of suspicious smell in the hotel. Red flag for air quality concerns.",
    icon: AlertTriangle,
    iconColor: 'text-orange-400',
  },
]

function VettingChecklist({ checklist }: { checklist: VettingChecklistItem[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-400" />
          <span className="font-semibold text-white">Vetting Checklist</span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
            {checklist.reduce((acc, cat) => acc + cat.items.filter(i => i.status === 'pass').length, 0)} checks passed
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {expanded ? 'Click to collapse' : 'Click to see how we verified'}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          {checklist.map((category, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <category.icon className="h-4 w-4 text-amber-400" />
                {category.category}
              </div>
              <div className="space-y-2 ml-6">
                {category.items.map((item, j) => (
                  <div key={j} className="rounded-lg bg-slate-800/50 p-3 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-white">{item.check}</span>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        item.status === 'pass' ? 'bg-emerald-500/20 text-emerald-300' :
                        item.status === 'warn' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {item.status === 'pass' ? '✓ PASS' : item.status === 'warn' ? '⚠ NOTE' : 'ℹ INFO'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      <strong>Method:</strong> {item.method}
                    </p>
                    <p className={`text-xs ${
                      item.status === 'pass' ? 'text-emerald-400' :
                      item.status === 'warn' ? 'text-amber-400' :
                      'text-slate-400'
                    }`}>
                      <strong>Result:</strong> {item.result}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PropertyCard({ property }: { property: RecommendedProperty }) {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header with badge */}
      <div className="relative">
        <div className="aspect-video overflow-hidden">
          <img
            src={property.imageUrl}
            alt={property.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </div>

        {/* Rank */}
        <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-2xl font-bold text-slate-900 shadow-lg shadow-amber-500/30">
          {property.rank}
        </div>

        {/* Badge */}
        <div className={`absolute right-4 top-4 rounded-full bg-gradient-to-r ${property.badgeColor} px-4 py-1.5 text-sm font-semibold text-white shadow-lg`}>
          {property.badge}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white">{property.name}</h3>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-3xl font-bold text-emerald-400">€{property.price.toLocaleString()}</span>
            <span className="text-slate-400">for 7 nights</span>
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-lg font-semibold">{property.rating}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Users className="h-4 w-4" />
              {property.reviewCount.toLocaleString()} reviews
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Key features grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
            <BedDouble className="mx-auto h-5 w-5 text-emerald-400" />
            <p className="mt-1 text-xs text-emerald-300">{property.keyFeatures.bedrooms}</p>
          </div>
          <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-center">
            <Waves className="mx-auto h-5 w-5 text-cyan-400" />
            <p className="mt-1 text-xs text-cyan-300">{property.keyFeatures.beach}</p>
          </div>
          <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 text-center">
            <Utensils className="mx-auto h-5 w-5 text-purple-400" />
            <p className="mt-1 text-xs text-purple-300">{property.keyFeatures.food}</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
            <VolumeX className="mx-auto h-5 w-5 text-amber-400" />
            <p className="mt-1 text-xs text-amber-300">{property.keyFeatures.quiet}</p>
          </div>
        </div>

        {/* Why Perfect */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <ThumbsUp className="h-4 w-4" />
            Why It's Perfect for You
          </h4>
          <ul className="space-y-2">
            {property.whyPerfect.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Considerations */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Things to Consider
          </h4>
          <ul className="space-y-2">
            {property.considerations.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-amber-500">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Evelina says */}
        {property.evelinaSays && (
          <div className="rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-transparent p-4">
            <div className="flex items-start gap-3">
              <Quote className="h-5 w-5 flex-shrink-0 text-pink-400" />
              <div>
                <p className="text-sm font-medium text-pink-300">Evelina says:</p>
                <p className="mt-1 text-sm italic text-slate-300">{property.evelinaSays}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verdict */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
          <p className="text-sm font-medium text-amber-200">{property.verdict}</p>
        </div>

        {/* Vetting Checklist */}
        <VettingChecklist checklist={property.vettingChecklist} />

        {/* Book button */}
        <a
          href={property.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-yellow-400 hover:shadow-lg hover:shadow-amber-500/30"
        >
          Book on Booking.com
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

function RecommendationPage() {
  const totalBudget = {
    sharmHills: 741 + 1500 + 300, // accommodation + flights + activities
    sunriseArabian: 1800 + 1500 + 100, // less activities budget with all-inclusive
    sunriseRemal: 1792 + 1500 + 100,
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 pb-12">
      {/* Hero Section */}
      <div className="text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 px-6 py-2 text-amber-200">
          <Crown className="h-5 w-5" />
          Final Recommendation
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
          Our Top 3 Picks for Henri & Evelina
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          After analyzing 16 properties, vetting reviews, and considering your specific needs
        </p>
      </div>

      {/* Your Priorities */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Shield className="h-5 w-5 text-amber-400" />
          Your Priorities We Optimized For
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-900/50 p-4 text-center">
            <BedDouble className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="mt-2 font-medium text-white">Snoring Isolation</p>
            <p className="mt-1 text-xs text-slate-400">Separate bedrooms = better sleep</p>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-4 text-center">
            <VolumeX className="mx-auto h-8 w-8 text-purple-400" />
            <p className="mt-2 font-medium text-white">Quiet Environment</p>
            <p className="mt-1 text-xs text-slate-400">No party hotels or nightclubs</p>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-4 text-center">
            <Star className="mx-auto h-8 w-8 text-amber-400" />
            <p className="mt-2 font-medium text-white">High Ratings</p>
            <p className="mt-1 text-xs text-slate-400">9.0+ with many reviews</p>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-4 text-center">
            <Wallet className="mx-auto h-8 w-8 text-cyan-400" />
            <p className="mt-2 font-medium text-white">Good Value</p>
            <p className="mt-1 text-xs text-slate-400">Quality without overpaying</p>
          </div>
        </div>
      </div>

      {/* Vetting Methodology */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Search className="h-5 w-5 text-cyan-400" />
          How We Vetted Each Property
        </h2>
        <p className="mb-4 text-sm text-slate-400">
          Every recommended property was manually verified using the following process:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-5 w-5 text-amber-400" />
              <span className="font-medium text-white text-sm">Screenshot Capture</span>
            </div>
            <p className="text-xs text-slate-400">
              Used Playwright MCP to navigate to Booking.com/Airbnb, captured full-page screenshots of room details
            </p>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BedDouble className="h-5 w-5 text-emerald-400" />
              <span className="font-medium text-white text-sm">Room Verification</span>
            </div>
            <p className="text-xs text-slate-400">
              Verified TRUE 2-bedroom configuration by reading room descriptions, checking bed counts in each room
            </p>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              <span className="font-medium text-white text-sm">Review Analysis</span>
            </div>
            <p className="text-xs text-slate-400">
              Searched reviews for red flags: noise, cleanliness, pests, maintenance, smell, scam
            </p>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-rose-400" />
              <span className="font-medium text-white text-sm">Price Verification</span>
            </div>
            <p className="text-xs text-slate-400">
              Confirmed prices on Booking.com for Feb 15-22, 2026 with 2 adults, 7 nights
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs text-slate-300">
            <strong className="text-amber-400">Note:</strong> Each property below has a "Vetting Checklist" you can expand to see exactly what was checked and the results.
          </p>
        </div>
      </div>

      {/* Top 3 Picks */}
      <div className="space-y-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Trophy className="h-6 w-6 text-amber-400" />
          The Top 3 Recommendations
        </h2>

        <div className="grid gap-8 lg:grid-cols-1">
          {TOP_3_PICKS.map((property) => (
            <PropertyCard key={property.rank} property={property} />
          ))}
        </div>
      </div>

      {/* Budget Comparison */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Wallet className="h-5 w-5 text-emerald-400" />
          Total Trip Budget Estimates
        </h2>
        <p className="mb-4 text-sm text-slate-400">Including flights (€750/person) and activities</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-900/50 p-4 text-center">
            <p className="text-xs text-amber-400">Sharm Hills</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">~€{totalBudget.sharmHills.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">Budget + flexibility</p>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-4 text-center">
            <p className="text-xs text-amber-400">Sunrise Arabian</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">~€{totalBudget.sunriseArabian.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">All-inclusive comfort</p>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-4 text-center">
            <p className="text-xs text-amber-400">Sunrise Remal</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">~€{totalBudget.sunriseRemal.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">Adults-only peace</p>
          </div>
        </div>
      </div>

      {/* Why NOT these properties */}
      <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <X className="h-5 w-5 text-rose-400" />
          Why NOT These High-Scoring Properties
        </h2>
        <p className="mb-4 text-sm text-slate-400">
          These scored well on paper but have issues that matter for your trip
        </p>
        <div className="space-y-4">
          {WHY_NOT.map((item, i) => (
            <div key={i} className="rounded-xl bg-slate-900/50 p-4">
              <div className="flex items-start gap-4">
                <item.icon className={`h-6 w-6 flex-shrink-0 ${item.iconColor}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-white">{item.name}</h4>
                    <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                      Score: {item.score}
                    </span>
                    <span className="text-sm text-emerald-400">€{item.price.toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-rose-400">{item.issue}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Verdict */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent p-8 text-center">
        <Award className="mx-auto h-12 w-12 text-amber-400" />
        <h2 className="mt-4 text-2xl font-bold text-white">Our Final Recommendation</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          For Henri & Evelina's Sharm el Sheikh trip, we recommend{' '}
          <span className="font-semibold text-amber-300">Sharm Hills</span> as the primary choice
          for its exceptional value, quiet environment, and true 2-bedroom configuration.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          If you prefer the convenience of All-Inclusive and don't mind a higher budget,{' '}
          <span className="text-emerald-300">Sunrise Arabian Beach - Family Suite</span> offers
          the best of both worlds with verified separate bedrooms and beachfront location.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <a
            href="https://www.booking.com/hotel/eg/sharm-hills-sharm-el-shiekh.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-yellow-400"
          >
            Book Sharm Hills
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href="https://www.booking.com/hotel/eg/sunrise-arabian-beach-resort.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-6 py-3 font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20"
          >
            Book Sunrise Arabian
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 text-sm">
        <Link to="/rankings" className="text-amber-400 hover:text-amber-300 transition-colors">
          ← View All Rankings
        </Link>
        <span className="text-slate-600">|</span>
        <Link to="/evelina" className="text-pink-400 hover:text-pink-300 transition-colors">
          Evelina's Research →
        </Link>
      </div>
    </div>
  )
}
