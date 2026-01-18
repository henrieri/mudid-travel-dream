import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Heart,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Check,
  X,
  ExternalLink,
  Plane,
  Home,
  Sparkles,
  Quote,
  Crown,
  Ban,
} from 'lucide-react'

interface Accommodation {
  id: number
  name: string
  price: number
  dates: string
  bookingUrl: string
  rating: number
  pros: string[]
  cons: string[]
  evelinaComment: string
  verdict: 'favorite' | 'consider' | 'caution'
}

interface Flight {
  option: string
  price: number
  pricePerPerson: number
  dates: string
  duration: string
  url: string
  notes: string
}

interface Rejected {
  name: string
  bookingUrl: string
  reason: string
}

interface ResearchData {
  researcher: string
  researchDate: string
  tripDates: string
  accommodations: Accommodation[]
  flights: Flight
  rejected: Rejected[]
}

export const Route = createFileRoute('/evelina')({
  component: EvelinaResearchPage,
})

const IMAGES: Record<number, string> = {
  1: '/evelina-images/sunrise-arabian-beach.jpg',
  2: '/evelina-images/white-hills-resort.jpg',
  3: '/evelina-images/sharm-hills-apartment.jpg',
}

function VerdictBadge({ verdict }: { verdict: Accommodation['verdict'] }) {
  const config = {
    favorite: {
      icon: Crown,
      label: "Evelina's Top Pick",
      className: 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-200 border-amber-500/40',
    },
    consider: {
      icon: ThumbsUp,
      label: 'Worth Considering',
      className: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    },
    caution: {
      icon: AlertTriangle,
      label: 'Proceed with Caution',
      className: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
    },
  }

  const { icon: Icon, label, className } = config[verdict]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

function AccommodationCard({ accommodation }: { accommodation: Accommodation }) {
  const image = IMAGES[accommodation.id]

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all ${
        accommodation.verdict === 'favorite'
          ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent ring-2 ring-amber-500/20'
          : accommodation.verdict === 'caution'
            ? 'border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent'
            : 'border-white/10 bg-white/5'
      }`}
    >
      {/* Image */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img src={image} alt={accommodation.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <VerdictBadge verdict={accommodation.verdict} />
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{accommodation.name}</h3>
            <p className="text-sm text-slate-400">{accommodation.dates}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">€{accommodation.price.toLocaleString()}</p>
            <div className="flex items-center justify-end gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-medium">{accommodation.rating}</span>
            </div>
          </div>
        </div>

        {/* Evelina's Comment */}
        <div className="rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-transparent p-4">
          <div className="flex items-start gap-3">
            <Quote className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-pink-200">Evelina says:</p>
              <p className="text-sm text-slate-300 italic mt-1">{accommodation.evelinaComment}</p>
            </div>
          </div>
        </div>

        {/* Pros */}
        {accommodation.pros.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <ThumbsUp className="h-3.5 w-3.5" />
              Pros
            </h4>
            <ul className="space-y-1.5">
              {accommodation.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {accommodation.cons.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <ThumbsDown className="h-3.5 w-3.5" />
              Cons
            </h4>
            <ul className="space-y-1.5">
              {accommodation.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <X className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Booking Link */}
        <a
          href={accommodation.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/20"
        >
          View on Booking.com
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

function EvelinaResearchPage() {
  const { data, isLoading } = useQuery<ResearchData>({
    queryKey: ['evelina-research'],
    queryFn: async () => {
      const response = await fetch('/evelina-research.json')
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
      </div>
    )
  }

  if (!data) return null

  const favorite = data.accommodations.find((a) => a.verdict === 'favorite')

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-gradient-to-r from-pink-500/20 to-rose-500/10 px-4 py-2 text-sm text-pink-200">
          <Heart className="h-4 w-4 fill-current" />
          Evelina's Research
        </div>
        <h1 className="text-3xl font-bold text-white">
          Sharm el Sheikh Trip Planning
        </h1>
        <p className="mt-2 text-slate-400">
          Carefully researched options for {data.tripDates} | By {data.researcher}
        </p>
      </div>

      {/* Favorite Pick Hero */}
      {favorite && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-900">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-amber-400/70">Evelina's Top Choice</p>
              <h2 className="text-xl font-bold text-white">{favorite.name}</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-center">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-2xl font-bold text-emerald-400">€{favorite.price.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total for 7 nights</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-2xl font-bold text-amber-400">{favorite.rating}/10</p>
              <p className="text-xs text-slate-500">Booking.com rating</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-2xl font-bold text-purple-400">125m²</p>
              <p className="text-xs text-slate-500">2 separate bedrooms</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-300 italic">
            "{favorite.evelinaComment}"
          </p>
        </div>
      )}

      {/* Flight Info */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-transparent p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
            <Plane className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Flight Research</h3>
            <p className="text-xs text-slate-400">{data.flights.option}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-4 text-center">
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-lg font-bold text-white">€{data.flights.pricePerPerson}</p>
            <p className="text-[10px] text-slate-500">per person</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-lg font-bold text-cyan-400">{data.flights.duration}</p>
            <p className="text-[10px] text-slate-500">direct flight</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-lg font-bold text-purple-400">TLL → SSH</p>
            <p className="text-[10px] text-slate-500">route</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-lg font-bold text-emerald-400">€{data.flights.price * 2}</p>
            <p className="text-[10px] text-slate-500">total (2 pax)</p>
          </div>
        </div>
        <a
          href={data.flights.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-200 hover:bg-blue-500/20 transition-colors"
        >
          View on Momondo
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Accommodations Grid */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
          <Home className="h-5 w-5 text-amber-400" />
          Researched Accommodations
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.accommodations.map((accommodation) => (
            <AccommodationCard key={accommodation.id} accommodation={accommodation} />
          ))}
        </div>
      </section>

      {/* Rejected Hotels */}
      <section className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Ban className="h-5 w-5 text-rose-400" />
          Hotels NOT to Consider
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Evelina found these hotels had deal-breaker issues:
        </p>
        <div className="space-y-3">
          {data.rejected.map((hotel, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-900/50 p-4">
              <X className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-white">{hotel.name}</h4>
                <p className="text-sm text-rose-300 mt-1">{hotel.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Research Notes */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          Research Methodology
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-300">
          <div>
            <p>
              <strong className="text-amber-200">Sources checked:</strong> Booking.com reviews,
              Estravel, direct hotel booking sites
            </p>
          </div>
          <div>
            <p>
              <strong className="text-amber-200">Key criteria:</strong> Quiet environment,
              2 separate bedrooms, good ratings, reasonable price
            </p>
          </div>
          <div>
            <p>
              <strong className="text-amber-200">Red flags searched:</strong> Noise complaints,
              party atmosphere, accessibility issues
            </p>
          </div>
          <div>
            <p>
              <strong className="text-amber-200">Budget range:</strong> €1,000 - €2,200 for
              7 nights accommodation
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 pb-8">
        <p>
          Research compiled by Evelina | {data.researchDate} |{' '}
          <span className="text-pink-400">Made with love for Henri</span>
        </p>
      </div>
    </div>
  )
}
