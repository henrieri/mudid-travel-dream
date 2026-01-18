import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Compass,
  Star,
  Clock,
  Wallet,
  MapPin,
  ThumbsUp,
  Waves,
  Mountain,
  ShoppingBag,
  Utensils,
  Umbrella,
  Sparkles,
} from 'lucide-react'

interface Activity {
  id: number
  name: string
  category: string
  rating: number
  reviews: number
  price: string
  duration: string
  description: string
  highlights: string[]
  bookingTip: string
  recommended: boolean
  source: string
}

export const Route = createFileRoute('/activities')({
  component: ActivitiesPage,
})

function getCategoryIcon(category: string) {
  switch (category) {
    case 'Water Activities':
      return <Waves className="h-4 w-4" />
    case 'Desert Adventures':
      return <Mountain className="h-4 w-4" />
    case 'Day Trips':
      return <MapPin className="h-4 w-4" />
    case 'Culture & Shopping':
    case 'Culture & Dining':
      return <ShoppingBag className="h-4 w-4" />
    case 'Beaches & Leisure':
      return <Umbrella className="h-4 w-4" />
    default:
      return <Compass className="h-4 w-4" />
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'Water Activities':
      return 'cyan'
    case 'Desert Adventures':
      return 'amber'
    case 'Day Trips':
      return 'purple'
    case 'Culture & Shopping':
    case 'Culture & Dining':
      return 'rose'
    case 'Beaches & Leisure':
      return 'emerald'
    default:
      return 'slate'
  }
}

function ActivityCard({ activity }: { activity: Activity }) {
  const color = getCategoryColor(activity.category)

  return (
    <div
      className={`rounded-2xl border p-5 transition-all hover:scale-[1.02] ${
        activity.recommended
          ? `border-${color}-500/30 bg-gradient-to-br from-${color}-500/10 via-${color}-500/5 to-transparent`
          : 'border-white/10 bg-white/5'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-${color}-500/20 text-${color}-300`}
            >
              {getCategoryIcon(activity.category)}
              {activity.category}
            </span>
            {activity.recommended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                <ThumbsUp className="h-3 w-3" />
                Top Pick
              </span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {activity.name}
          </h3>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold">{activity.rating}</span>
          </div>
          <p className="text-xs text-slate-400">({activity.reviews} reviews)</p>
        </div>
      </div>

      {/* Price & Duration */}
      <div className="mt-3 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Wallet className="h-4 w-4" />
          <span className="font-medium">{activity.price}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="h-4 w-4" />
          <span>{activity.duration}</span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-slate-300 leading-relaxed">
        {activity.description}
      </p>

      {/* Highlights */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {activity.highlights.map((highlight) => (
          <span
            key={highlight}
            className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400"
          >
            {highlight}
          </span>
        ))}
      </div>

      {/* Booking Tip */}
      <div className={`mt-4 rounded-lg bg-${color}-500/10 border border-${color}-500/20 p-3`}>
        <p className="text-xs">
          <Sparkles className={`inline h-3 w-3 text-${color}-400 mr-1`} />
          <span className={`font-medium text-${color}-200`}>Tip:</span>{' '}
          <span className="text-slate-300">{activity.bookingTip}</span>
        </p>
      </div>

      {/* Source */}
      <p className="mt-3 text-xs text-slate-500">Source: {activity.source}</p>
    </div>
  )
}

function ActivitiesPage() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await fetch('/activities.json')
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  const recommended = activities?.filter((a) => a.recommended) ?? []
  const other = activities?.filter((a) => !a.recommended) ?? []

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
          <Compass className="h-4 w-4" />
          12 Activities Researched & Ranked
        </div>
        <h1 className="text-3xl font-bold text-white">
          Top Activities in Sharm el Sheikh
        </h1>
        <p className="mt-2 text-slate-400">
          Based on TripAdvisor, Viator, and local recommendations | Feb 2026
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">6</p>
          <p className="text-xs text-slate-400">Water Activities</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">1</p>
          <p className="text-xs text-slate-400">Desert Safari</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">2</p>
          <p className="text-xs text-slate-400">Day Trips</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">3</p>
          <p className="text-xs text-slate-400">Beach & Culture</p>
        </div>
      </div>

      {/* Recommended Activities */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
          <ThumbsUp className="h-5 w-5 text-amber-400" />
          Our Top Picks for You
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {recommended.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>

      {/* Other Activities */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
          <Compass className="h-5 w-5 text-slate-400" />
          Other Activities
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {other.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>

      {/* Booking Tips */}
      <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Sparkles className="h-5 w-5 text-amber-400" />
          General Booking Tips
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 text-sm text-slate-300">
            <p>
              <strong className="text-amber-200">Book through hotel:</strong>{' '}
              Often 10-20% cheaper than online, includes pickup
            </p>
            <p>
              <strong className="text-amber-200">Bargain in person:</strong>{' '}
              Street vendors offer 30-50% discounts off posted prices
            </p>
            <p>
              <strong className="text-amber-200">Pay in EGP:</strong>{' '}
              Always better rate than EUR
            </p>
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <p>
              <strong className="text-amber-200">Best time:</strong>{' '}
              Morning trips avoid afternoon wind and crowds
            </p>
            <p>
              <strong className="text-amber-200">Reef-safe sunscreen:</strong>{' '}
              Required for Ras Mohammed National Park
            </p>
            <p>
              <strong className="text-amber-200">Cash tips:</strong>{' '}
              Bring small EGP notes (20-50 EGP) for boat crew
            </p>
          </div>
        </div>
      </section>

      {/* Sources */}
      <div className="text-center text-xs text-slate-500">
        <p>
          Sources:{' '}
          <a
            href="https://www.tripadvisor.com/Attractions-g297555-Activities-Sharm_El_Sheikh_South_Sinai_Red_Sea_and_Sinai.html"
            className="text-cyan-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            TripAdvisor
          </a>
          {' | '}
          <a
            href="https://www.viator.com/Sharm-el-Sheikh/d827"
            className="text-cyan-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Viator
          </a>
          {' | '}
          <a
            href="https://jakadatoursegypt.com/things-to-do-in-sharm-el-sheikh/"
            className="text-cyan-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jakada Tours
          </a>
        </p>
      </div>
    </div>
  )
}
