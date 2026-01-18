import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Trophy,
  Star,
  Users,
  ExternalLink,
  BedDouble,
  Waves,
  Check,
  Sparkles,
  TrendingUp,
  Heart,
  MapPin,
} from 'lucide-react'

interface Property {
  id: number
  source: string
  name: string
  price_eur: number | null
  rating: number | null
  review_count: number | null
  henri_score: number | null
  henri_tier: string | null
  has_separate_bedrooms: boolean | null
  is_beachfront: boolean | null
  is_all_inclusive: boolean | null
  is_adults_only: boolean | null
  verified: boolean | null
  thumbnail_url: string | null
  source_url: string | null
  score_snoring: number | null
  score_beach: number | null
  score_rating: number | null
}

export const Route = createFileRoute('/')(({
  component: DashboardPage,
}))

function PropertyCard({ property, rank }: { property: Property; rank: number }) {
  const tierColors: Record<string, string> = {
    Excellent: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/40 text-emerald-300',
    'Very Good': 'from-amber-500/20 to-amber-500/5 border-amber-500/40 text-amber-300',
    Good: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/40 text-cyan-300',
    Average: 'from-slate-500/20 to-slate-500/5 border-slate-500/40 text-slate-300',
    Poor: 'from-rose-500/20 to-rose-500/5 border-rose-500/40 text-rose-300',
  }

  const tierColor = tierColors[property.henri_tier || 'Average'] || tierColors.Average

  return (
    <Link
      to="/property/$id"
      params={{ id: String(property.id) }}
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/10 ${tierColor} block`}
    >
      {/* Rank badge */}
      <div className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/90 text-sm font-bold text-amber-400 shadow-lg">
        {rank}
      </div>

      {/* Source badge */}
      <div className="absolute right-3 top-3 z-10">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            property.source === 'booking'
              ? 'bg-blue-500/20 text-blue-300'
              : 'bg-rose-500/20 text-rose-300'
          }`}
        >
          {property.source}
        </span>
      </div>

      {/* Thumbnail */}
      {property.thumbnail_url ? (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={property.thumbnail_url}
            alt={property.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-amber-500/10 to-slate-900 flex items-center justify-center">
          <MapPin className="h-12 w-12 text-amber-500/30" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title + Score */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-white line-clamp-2 flex-1">
            {property.name}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-amber-400">{property.henri_score || 0}</span>
            <span className="text-[10px] uppercase tracking-wider text-amber-500/70">
              {property.henri_tier}
            </span>
          </div>
        </div>

        {/* Price + Rating */}
        <div className="flex items-center gap-4 text-xs">
          {property.price_eur && (
            <span className="font-medium text-emerald-400">
              €{property.price_eur.toLocaleString()}
            </span>
          )}
          {property.rating && (
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              {property.rating}
            </span>
          )}
          {property.review_count && (
            <span className="flex items-center gap-1 text-slate-400">
              <Users className="h-3 w-3" />
              {property.review_count.toLocaleString()}
            </span>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {property.has_separate_bedrooms && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
              <BedDouble className="h-3 w-3" />
              2 Bedrooms
            </span>
          )}
          {property.is_beachfront && (
            <span className="flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300">
              <Waves className="h-3 w-3" />
              Beachfront
            </span>
          )}
          {property.is_all_inclusive && (
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">
              All-Inclusive
            </span>
          )}
          {property.is_adults_only && (
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-300">
              Adults Only
            </span>
          )}
          {property.verified && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
              <Check className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Heart className="h-3.5 w-3.5" />
            Save
          </button>
          {property.source_url && (
            <a
              href={property.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              View
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </Link>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subvalue,
  color,
}: {
  icon: typeof Trophy
  label: string
  value: string
  subvalue?: string
  color: string
}) {
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {subvalue && <p className="text-xs text-slate-400">{subvalue}</p>}
        </div>
        <Icon className="h-5 w-5 text-amber-400/50" />
      </div>
    </div>
  )
}

function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from static JSON for now
    fetch('/unified-properties.json')
      .then((res) => res.json())
      .then((data) => {
        setProperties(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const topPicks = properties
    .filter((p) => p.henri_score != null)
    .sort((a, b) => (b.henri_score || 0) - (a.henri_score || 0))
    .slice(0, 6)

  const verifiedPicks = properties.filter((p) => p.verified && p.has_separate_bedrooms)
  const avgScore = properties.length
    ? Math.round(properties.reduce((sum, p) => sum + (p.henri_score || 0), 0) / properties.length)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-amber-400">
          <Sparkles className="h-5 w-5 animate-pulse" />
          Loading properties...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-500/50">
          Feb 15-22, 2026
        </p>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
          Sharm el Sheikh Trip
        </h1>
        <p className="text-sm text-slate-400">
          {properties.length} properties analyzed across Booking.com and Airbnb
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Trophy}
          label="Top Score"
          value={topPicks[0]?.henri_score?.toString() || '0'}
          subvalue={topPicks[0]?.name?.substring(0, 20) || ''}
          color="from-amber-500/10 to-transparent border-amber-500/20"
        />
        <StatCard
          icon={BedDouble}
          label="Verified 2BR"
          value={verifiedPicks.length.toString()}
          subvalue="True separate bedrooms"
          color="from-emerald-500/10 to-transparent border-emerald-500/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={avgScore.toString()}
          subvalue="Across all properties"
          color="from-cyan-500/10 to-transparent border-cyan-500/20"
        />
        <StatCard
          icon={Star}
          label="Sources"
          value="2"
          subvalue="Booking + Airbnb"
          color="from-purple-500/10 to-transparent border-purple-500/20"
        />
      </div>

      {/* Recommendation Banner */}
      {verifiedPicks.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-200">Top Recommendation</h3>
              <p className="mt-1 text-sm text-slate-400">
                <span className="font-medium text-white">{verifiedPicks[0]?.name}</span> is our
                verified top pick with true 2-bedroom configuration for snoring isolation at{' '}
                <span className="text-emerald-400">€{verifiedPicks[0]?.price_eur?.toLocaleString()}</span>
              </p>
            </div>
            <a
              href={verifiedPicks[0]?.source_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/20 transition-colors"
            >
              View Details
            </a>
          </div>
        </div>
      )}

      {/* Top Picks Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Top Picks by Henri Score
          </h2>
          <a
            href="/rankings"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            View all rankings →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPicks.map((property, i) => (
            <PropertyCard key={property.id} property={property} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
