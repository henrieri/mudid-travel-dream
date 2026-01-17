import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Heart,
  Star,
  Users,
  ExternalLink,
  BedDouble,
  Palmtree,
  UtensilsCrossed,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface ScoredProperty {
  id: number
  n: string // name
  p: number | null // price
  r: number | null // rating
  c: number | null // review count
  u: string // url
  s: string // status
  ao: boolean // adults-only
  ai: boolean // all-inclusive
  hs: number // henri score
  ht: string // henri tier
  ss: number // score_snoring
  sb: number // score_beach
  sr: number // score_rating
  sa: number // score_adults
  sai: number // score_allinc
  sam: number // score_amenities
  srl: number // score_reliability
  bd: string // breakdown
}

export const Route = createFileRoute('/shortlist')({
  component: ShortlistPage,
})

function TierBadge({ tier, score }: { tier: string; score: number }) {
  const colors: Record<string, string> = {
    Excellent: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    'Very Good': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    Good: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Average: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    Poor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }

  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1 ${colors[tier] || colors.Average}`}>
      <span className="text-lg font-bold">{score}</span>
      <span className="text-xs uppercase tracking-wider">{tier}</span>
    </div>
  )
}

function ScoreBar({ label, score, max, icon: Icon }: { label: string; score: number; max: number; icon: typeof BedDouble }) {
  const percent = (score / max) * 100

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-slate-500" />
      <span className="w-16 text-xs text-slate-400">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${score > 0 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-slate-700'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-slate-500">{score}/{max}</span>
    </div>
  )
}

function PropertyCard({ property, rank }: { property: ScoredProperty; rank: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-2xl border transition ${
      property.ht === 'Excellent' ? 'border-emerald-500/40 bg-emerald-500/5' :
      property.ht === 'Very Good' ? 'border-cyan-500/30 bg-cyan-500/5' :
      'border-white/10 bg-white/5'
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-lg font-bold text-amber-400">
            {rank}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white truncate">{property.n}</h3>
              <a
                href={property.u}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {property.p && (
                <span className={`font-medium ${property.p < 1200 ? 'text-emerald-400' : property.p < 2000 ? 'text-amber-300' : 'text-slate-300'}`}>
                  €{property.p.toLocaleString()}
                </span>
              )}
              {property.r && (
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="h-3 w-3" />
                  {property.r}
                </span>
              )}
              {property.c && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Users className="h-3 w-3" />
                  {property.c.toLocaleString()}
                </span>
              )}
              {property.ao && (
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-violet-300">
                  Adults Only
                </span>
              )}
              {property.ai && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                  All Inclusive
                </span>
              )}
            </div>
          </div>

          {/* Score badge */}
          <TierBadge tier={property.ht} score={property.hs} />
        </div>

        {/* Score breakdown bars */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          <ScoreBar label="Snoring" score={property.ss} max={35} icon={BedDouble} />
          <ScoreBar label="Beach" score={property.sb} max={15} icon={Palmtree} />
          <ScoreBar label="Rating" score={property.sr} max={15} icon={Star} />
          <ScoreBar label="Adults" score={property.sa} max={10} icon={User} />
          <ScoreBar label="All-Inc" score={property.sai} max={10} icon={UtensilsCrossed} />
          <ScoreBar label="Reviews" score={property.srl} max={5} icon={Users} />
        </div>

        {/* Expand/collapse */}
        {property.bd && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? 'Hide details' : 'Show score details'}
          </button>
        )}

        {expanded && property.bd && (
          <div className="mt-2 rounded-lg bg-slate-900/50 p-3 text-xs text-slate-400 font-mono">
            {property.bd.split(' | ').map((item, i) => (
              <div key={i}>{item}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ShortlistPage() {
  const [properties, setProperties] = useState<ScoredProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [minScore, setMinScore] = useState(0)

  useEffect(() => {
    fetch('/scored-properties.json')
      .then((res) => res.json())
      .then((data) => {
        setProperties(data || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filtered = properties.filter((p) => {
    if (tierFilter !== 'all' && p.ht !== tierFilter) return false
    if (p.hs < minScore) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading shortlist...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
        <p className="text-rose-300">Error: {error}</p>
      </div>
    )
  }

  const tiers = ['Excellent', 'Very Good', 'Good', 'Average', 'Poor']
  const tierCounts = tiers.reduce((acc, tier) => {
    acc[tier] = properties.filter((p) => p.ht === tier).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Henri & Evelina Score
        </p>
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-rose-400" />
          <h1 className="text-2xl font-semibold text-white">
            Shortlist ({filtered.length})
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Properties ranked by snoring isolation, beach access, amenities & preferences
        </p>
      </header>

      {/* Tier summary */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTierFilter('all')}
          className={`rounded-full border px-3 py-1 text-xs transition ${
            tierFilter === 'all'
              ? 'border-amber-400/40 bg-amber-500/20 text-amber-300'
              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
          }`}
        >
          All ({properties.length})
        </button>
        {tiers.map((tier) => (
          <button
            key={tier}
            onClick={() => setTierFilter(tierFilter === tier ? 'all' : tier)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              tierFilter === tier
                ? tier === 'Excellent' ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' :
                  tier === 'Very Good' ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300' :
                  tier === 'Good' ? 'border-amber-500/40 bg-amber-500/20 text-amber-300' :
                  'border-slate-500/40 bg-slate-500/20 text-slate-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
            }`}
          >
            {tier} ({tierCounts[tier] || 0})
          </button>
        ))}
      </div>

      {/* Min score filter */}
      <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <label className="text-xs text-slate-400">Minimum Score:</label>
        <input
          type="range"
          min="0"
          max="80"
          step="5"
          value={minScore}
          onChange={(e) => setMinScore(parseInt(e.target.value))}
          className="w-40"
        />
        <span className="text-sm font-medium text-amber-400">{minScore}+</span>
      </div>

      {/* Property list */}
      <div className="space-y-4">
        {filtered.map((property, i) => (
          <PropertyCard key={property.id} property={property} rank={i + 1} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-slate-400">No properties match your filters</p>
        </div>
      )}
    </div>
  )
}
