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

// Sample destinations data (will come from DB later)
const destinations = [
  {
    code: 'HKT',
    name: 'Phuket',
    country: 'Thailand',
    region: 'Southeast Asia',
    avgTemp: 31,
    sunshine: 9,
    beachQuality: 9,
    flightPrice: 560,
    groundCost: 1400,
    experientialValue: 2900,
    finalValue: 940,
    imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400',
  },
  {
    code: 'BKK',
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Southeast Asia',
    avgTemp: 32,
    sunshine: 9,
    beachQuality: 7,
    flightPrice: 520,
    groundCost: 1200,
    experientialValue: 2600,
    finalValue: 880,
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400',
  },
  {
    code: 'CMB',
    name: 'Colombo',
    country: 'Sri Lanka',
    region: 'South Asia',
    avgTemp: 28,
    sunshine: 8,
    beachQuality: 8,
    flightPrice: 680,
    groundCost: 1400,
    experientialValue: 2850,
    finalValue: 770,
    imageUrl: 'https://images.unsplash.com/photo-1588598198321-53a9b8e3b2f6?w=400',
  },
  {
    code: 'ZNZ',
    name: 'Zanzibar',
    country: 'Tanzania',
    region: 'East Africa',
    avgTemp: 30,
    sunshine: 8,
    beachQuality: 9,
    flightPrice: 750,
    groundCost: 1600,
    experientialValue: 3100,
    finalValue: 750,
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400',
  },
  {
    code: 'DPS',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    avgTemp: 27,
    sunshine: 7,
    beachQuality: 8,
    flightPrice: 780,
    groundCost: 1800,
    experientialValue: 3200,
    finalValue: 620,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
  },
  {
    code: 'MLE',
    name: 'Maldives',
    country: 'Maldives',
    region: 'South Asia',
    avgTemp: 29,
    sunshine: 9,
    beachQuality: 10,
    flightPrice: 620,
    groundCost: 3500,
    experientialValue: 3800,
    finalValue: -320,
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400',
  },
]

export const Route = createFileRoute('/')({
  component: DestinationsPage,
})

function DestinationsPage() {
  const sortedDestinations = [...destinations].sort(
    (a, b) => b.finalValue - a.finalValue
  )

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
          value={sortedDestinations[0]?.name ?? '-'}
          subvalue={`+€${sortedDestinations[0]?.finalValue ?? 0} net value`}
          icon={<Star className="h-5 w-5 text-amber-400" />}
          gradient="from-amber-500/20 to-orange-500/10"
        />
        <SummaryCard
          label="Cheapest Flights"
          value={
            [...destinations].sort((a, b) => a.flightPrice - b.flightPrice)[0]
              ?.name ?? '-'
          }
          subvalue={`€${Math.min(...destinations.map((d) => d.flightPrice))} per person`}
          icon={<Plane className="h-5 w-5 text-cyan-400" />}
          gradient="from-cyan-500/20 to-blue-500/10"
        />
        <SummaryCard
          label="Best Beach"
          value={
            [...destinations].sort((a, b) => b.beachQuality - a.beachQuality)[0]?.name ?? '-'
          }
          subvalue={`${Math.max(...destinations.map((d) => d.beachQuality))}/10 quality`}
          icon={<Waves className="h-5 w-5 text-blue-400" />}
          gradient="from-blue-500/20 to-indigo-500/10"
        />
      </div>

      {/* Destinations Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {sortedDestinations.map((dest, index) => (
          <DestinationCard key={dest.code} destination={dest} rank={index + 1} />
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
  destination,
  rank,
}: {
  destination: (typeof destinations)[0]
  rank: number
}) {
  const isPositiveValue = destination.finalValue > 0

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 transition hover:border-amber-500/30">
      <div className="flex">
        {/* Image */}
        <div className="relative h-40 w-40 shrink-0 overflow-hidden">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/90 text-xs font-bold text-amber-400">
            #{rank}
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
              {destination.avgTemp}°C
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sun className="h-3.5 w-3.5 text-yellow-400" />
              {destination.sunshine}h sun
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Plane className="h-3.5 w-3.5 text-cyan-400" />€
              {destination.flightPrice}
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />€
              {destination.groundCost}/14d
            </div>
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
                {isPositiveValue ? '+' : ''}€{destination.finalValue}
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
