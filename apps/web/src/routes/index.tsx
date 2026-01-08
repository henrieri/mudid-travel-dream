import { createFileRoute } from '@tanstack/react-router'
import {
  Sun,
  Thermometer,
  Plane,
  DollarSign,
  TrendingUp,
  Palmtree,
  Star,
  Waves,
} from 'lucide-react'
import {
  DESTINATIONS,
  evaluateTrip,
  type Destination,
  type Trip,
  type TripEvaluation,
} from '@mudid/scoring'

// Create sample trips with mock flight data to demonstrate scoring
function createSampleTrip(destination: Destination): Trip {
  // Sample flight prices based on destination region
  const flightPrices: Record<string, number> = {
    'Southeast Asia': 520,
    'South Asia': 620,
    'East Africa': 750,
    'Indian Ocean': 680,
  }

  const basePrice = flightPrices[destination.region] ?? 600
  const tripDays = 14

  return {
    destination,
    tripDays,
    totalFlightPrice: basePrice * 2, // Round trip for 2 adults
    currency: 'EUR',
    outbound: {
      date: '2026-02-10',
      price: basePrice,
      stops: 1,
      durationHours: destination.region === 'East Africa' ? 14 : 12,
    },
    return: {
      date: '2026-02-24',
      price: basePrice,
      stops: 1,
      durationHours: destination.region === 'East Africa' ? 14 : 12,
    },
  }
}

// Evaluate all destinations
const evaluatedDestinations = Object.values(DESTINATIONS).map((dest) => {
  const trip = createSampleTrip(dest)
  return evaluateTrip(trip)
})

export const Route = createFileRoute('/')({
  component: DestinationsPage,
})

function DestinationsPage() {
  const sortedDestinations = [...evaluatedDestinations].sort(
    (a, b) => b.finalValue - a.finalValue
  )

  // Find best in each category
  const cheapest = [...evaluatedDestinations].sort(
    (a, b) => a.costs.flights - b.costs.flights
  )[0]

  const bestBeach = [...evaluatedDestinations].sort(
    (a, b) => b.trip.destination.beachQuality - a.trip.destination.beachQuality
  )[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          February 2026 Escape
        </p>
        <div className="flex items-center gap-3">
          <Palmtree className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-semibold text-white">
            Destination Rankings
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Optimal winter escapes scored by experiential value per euro
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Best Value"
          value={sortedDestinations[0]?.trip.destination.name ?? '-'}
          subvalue={`${sortedDestinations[0]?.finalValue > 0 ? '+' : ''}€${Math.round(sortedDestinations[0]?.finalValue ?? 0)} net value`}
          icon={<Star className="h-5 w-5 text-amber-400" />}
          gradient="from-amber-500/20 to-orange-500/10"
        />
        <SummaryCard
          label="Cheapest Flights"
          value={cheapest?.trip.destination.name ?? '-'}
          subvalue={`€${Math.round(cheapest?.costs.flights / 2 ?? 0)} per person`}
          icon={<Plane className="h-5 w-5 text-cyan-400" />}
          gradient="from-cyan-500/20 to-blue-500/10"
        />
        <SummaryCard
          label="Best Beach"
          value={bestBeach?.trip.destination.name ?? '-'}
          subvalue={`${bestBeach?.trip.destination.beachQuality}/10 quality`}
          icon={<Waves className="h-5 w-5 text-blue-400" />}
          gradient="from-blue-500/20 to-indigo-500/10"
        />
      </div>

      {/* Destinations Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {sortedDestinations.map((evaluation, index) => (
          <DestinationCard
            key={evaluation.trip.destination.code}
            evaluation={evaluation}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  subvalue,
  icon,
  gradient,
}: {
  label: string
  value: string
  subvalue: string
  icon: React.ReactNode
  gradient: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 text-lg font-semibold text-white">{value}</p>
          <p className="text-xs text-slate-500">{subvalue}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}

function DestinationCard({
  evaluation,
  rank,
}: {
  evaluation: TripEvaluation
  rank: number
}) {
  const { trip, finalValue, roi, recommendation, costs, experiential } = evaluation
  const { destination } = trip
  const isPositiveValue = finalValue > 0

  // Recommendation badge colors
  const recommendationColors: Record<string, string> = {
    exceptional: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    great: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    good: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    mediocre: 'bg-slate-500/20 text-slate-300 border-slate-400/30',
    expensive: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 transition hover:border-amber-500/30">
      <div className="flex">
        {/* Image */}
        <div className="relative h-48 w-40 shrink-0 overflow-hidden">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/90 text-xs font-bold text-amber-400">
            #{rank}
          </div>
          <div className={`absolute bottom-2 left-2 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wide ${recommendationColors[recommendation]}`}>
            {recommendation}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">{destination.name}</h3>
              <p className="text-xs text-slate-500">{destination.country} · {destination.region}</p>
            </div>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {destination.code}
            </span>
          </div>

          {/* Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Thermometer className="h-3.5 w-3.5 text-orange-400" />
              {destination.avgTempFeb}°C
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sun className="h-3.5 w-3.5 text-yellow-400" />
              {destination.sunshineHours}h sun
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Plane className="h-3.5 w-3.5 text-cyan-400" />
              €{Math.round(costs.flights / 2)}/pp
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              €{Math.round(costs.total - costs.flights)}/14d ground
            </div>
          </div>

          {/* Value breakdown */}
          <div className="mt-3 flex items-center gap-3 text-[10px]">
            <span className="text-slate-500">
              Exp: €{Math.round(experiential.adjusted)}
            </span>
            <span className="text-slate-500">
              Cost: €{Math.round(costs.total)}
            </span>
            <span className="text-slate-500">
              ROI: {Math.round(roi)}%
            </span>
          </div>

          {/* Value Score */}
          <div className="mt-auto flex items-center justify-between pt-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp
                className={`h-4 w-4 ${isPositiveValue ? 'text-emerald-400' : 'text-rose-400'}`}
              />
              <span
                className={`text-sm font-semibold ${isPositiveValue ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {isPositiveValue ? '+' : ''}€{Math.round(finalValue)}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              net value
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
