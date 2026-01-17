import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Star,
  Users,
  ExternalLink,
  BedDouble,
  Waves,
  Check,
  MapPin,
  Sparkles,
  Heart,
  Share2,
  Utensils,
  User,
  Shield,
  Trophy,
  TrendingUp,
  Home,
} from 'lucide-react'

interface Property {
  id: number
  source: string
  source_url: string | null
  name: string
  price_eur: number | null
  rating: number | null
  review_count: number | null
  area: string | null
  beach_distance: string | null
  is_beachfront: boolean | null
  room_type: string | null
  bedroom_count: number | null
  has_separate_bedrooms: boolean | null
  is_all_inclusive: boolean | null
  is_adults_only: boolean | null
  henri_score: number | null
  henri_tier: string | null
  score_snoring: number | null
  score_beach: number | null
  score_rating: number | null
  score_adults: number | null
  score_allinc: number | null
  score_amenities: number | null
  score_reliability: number | null
  verified: boolean | null
  verified_notes: string | null
  thumbnail_url: string | null
  status: string | null
  is_favorite: boolean | null
}

export const Route = createFileRoute('/property/$id')({
  component: PropertyDetailPage,
})

function ScoreBar({ label, score, maxScore, icon: Icon }: { label: string; score: number; maxScore: number; icon: typeof Trophy }) {
  const percentage = (score / maxScore) * 100

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <span className="font-medium text-white">{score}/{maxScore}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function PropertyDetailPage() {
  const { id } = Route.useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/unified-properties.json')
      .then((res) => res.json())
      .then((data: Property[]) => {
        const found = data.find((p) => p.id === Number(id))
        setProperty(found || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-amber-400">
          <Sparkles className="h-5 w-5 animate-pulse" />
          Loading property...
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-slate-400">Property not found</p>
        <Link
          to="/rankings"
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to rankings
        </Link>
      </div>
    )
  }

  const tierColors: Record<string, string> = {
    Excellent: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/40 text-emerald-300',
    'Very Good': 'from-amber-500/20 to-amber-500/5 border-amber-500/40 text-amber-300',
    Good: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/40 text-cyan-300',
    Average: 'from-slate-500/20 to-slate-500/5 border-slate-500/40 text-slate-300',
    Poor: 'from-rose-500/20 to-rose-500/5 border-rose-500/40 text-rose-300',
  }

  const tierColor = tierColors[property.henri_tier || 'Average'] || tierColors.Average

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-amber-400 transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        <span>/</span>
        <Link to="/rankings" className="hover:text-amber-400 transition-colors">
          Rankings
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[200px]">{property.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                property.source === 'booking'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {property.source}
            </span>
            {property.verified && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">
                <Check className="h-3 w-3" /> Verified
              </span>
            )}
            {property.status && (
              <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] text-slate-400 capitalize">
                {property.status}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{property.name}</h1>
          {property.area && (
            <p className="flex items-center gap-1 text-sm text-slate-400">
              <MapPin className="h-4 w-4" />
              {property.area}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors">
            <Heart className="h-4 w-4" />
            Save
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition-colors">
            <Share2 className="h-4 w-4" />
            Share
          </button>
          {property.source_url && (
            <a
              href={property.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/20 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View on {property.source === 'booking' ? 'Booking.com' : 'Airbnb'}
            </a>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Image and details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Hero image */}
          <div className="relative overflow-hidden rounded-2xl">
            {property.thumbnail_url ? (
              <img
                src={property.thumbnail_url}
                alt={property.name}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="aspect-[16/9] bg-gradient-to-br from-amber-500/10 to-slate-900 flex items-center justify-center">
                <MapPin className="h-16 w-16 text-amber-500/30" />
              </div>
            )}
            {/* Price overlay */}
            {property.price_eur && (
              <div className="absolute bottom-4 right-4 rounded-xl bg-slate-900/90 backdrop-blur-sm px-4 py-2 border border-white/10">
                <p className="text-2xl font-bold text-emerald-400">
                  €{property.price_eur.toLocaleString()}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  7 nights, 2 adults
                </p>
              </div>
            )}
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {property.rating && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-bold text-white">{property.rating}</span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                  Rating ({property.review_count?.toLocaleString()} reviews)
                </p>
              </div>
            )}

            {property.has_separate_bedrooms !== null && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <BedDouble className={`h-5 w-5 ${property.has_separate_bedrooms ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-xl font-bold text-white">
                    {property.has_separate_bedrooms ? '2 BR' : '1 BR'}
                  </span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                  {property.has_separate_bedrooms ? 'Separate bedrooms' : 'Single room'}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <Waves className={`h-5 w-5 ${property.is_beachfront ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-sm font-bold text-white">
                  {property.is_beachfront ? 'Beachfront' : property.beach_distance || 'N/A'}
                </span>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                Beach access
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <Utensils className={`h-5 w-5 ${property.is_all_inclusive ? 'text-purple-400' : 'text-slate-500'}`} />
                <span className="text-sm font-bold text-white">
                  {property.is_all_inclusive ? 'All-Incl' : 'Room Only'}
                </span>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                Meal plan
              </p>
            </div>
          </div>

          {/* Additional info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h3 className="font-semibold text-white">Property Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {property.room_type && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                    <Home className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Room Type</p>
                    <p className="text-sm text-white capitalize">{property.room_type}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Guest Policy</p>
                  <p className="text-sm text-white">
                    {property.is_adults_only ? 'Adults Only (18+)' : 'All Ages Welcome'}
                  </p>
                </div>
              </div>

              {property.bedroom_count && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                    <BedDouble className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Bedrooms</p>
                    <p className="text-sm text-white">{property.bedroom_count}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                  <Shield className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Verified</p>
                  <p className="text-sm text-white">
                    {property.verified ? 'Yes - Room config confirmed' : 'Not yet verified'}
                  </p>
                </div>
              </div>
            </div>

            {property.verified_notes && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-xs text-amber-200">
                  <strong>Verification notes:</strong> {property.verified_notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Henri Score */}
        <div className="space-y-6">
          {/* Score card */}
          <div className={`rounded-2xl border bg-gradient-to-br p-6 ${tierColor}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">Henri Score</p>
                <p className="mt-1 text-5xl font-bold text-white">
                  {property.henri_score ?? '—'}
                </p>
              </div>
              <Trophy className="h-8 w-8 opacity-50" />
            </div>
            {property.henri_tier && (
              <div className="mt-4">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  {property.henri_tier}
                </span>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Score Breakdown</h3>
              <TrendingUp className="h-4 w-4 text-slate-500" />
            </div>
            <div className="space-y-3">
              <ScoreBar
                label="Snoring Isolation"
                score={property.score_snoring || 0}
                maxScore={35}
                icon={BedDouble}
              />
              <ScoreBar
                label="Beach Access"
                score={property.score_beach || 0}
                maxScore={15}
                icon={Waves}
              />
              <ScoreBar
                label="Rating Quality"
                score={property.score_rating || 0}
                maxScore={15}
                icon={Star}
              />
              <ScoreBar
                label="Adults Only"
                score={property.score_adults || 0}
                maxScore={10}
                icon={User}
              />
              <ScoreBar
                label="All-Inclusive"
                score={property.score_allinc || 0}
                maxScore={10}
                icon={Utensils}
              />
              <ScoreBar
                label="Reliability"
                score={property.score_reliability || 0}
                maxScore={5}
                icon={Shield}
              />
            </div>
          </div>

          {/* Snoring assessment */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold text-white mb-3">Snoring Assessment</h3>
            <div className={`rounded-xl p-4 ${property.has_separate_bedrooms ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
              {property.has_separate_bedrooms ? (
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm text-emerald-300">
                    <Check className="h-4 w-4" />
                    Excellent for snoring isolation
                  </p>
                  <p className="text-xs text-emerald-400/70">
                    Verified separate bedrooms with doors - Evelina can sleep peacefully!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm text-amber-300">
                    <BedDouble className="h-4 w-4" />
                    Limited snoring isolation
                  </p>
                  <p className="text-xs text-amber-400/70">
                    Single room or open layout - may need to verify if twin beds available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Back link */}
          <Link
            to="/rankings"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rankings
          </Link>
        </div>
      </div>
    </div>
  )
}
