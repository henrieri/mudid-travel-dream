import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import {
  Trophy,
  Star,
  Users,
  ExternalLink,
  BedDouble,
  Waves,
  Check,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Heart,
  Sparkles,
  Eye,
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
  verified: boolean | null
  verified_notes: string | null
  thumbnail_url: string | null
  status: string | null
  is_favorite: boolean | null
}

type SortKey = 'henri_score' | 'price_eur' | 'rating' | 'review_count' | 'name'
type SortDir = 'asc' | 'desc'

interface Filters {
  source: 'all' | 'booking' | 'airbnb'
  minScore: number
  maxPrice: number
  hasSeparateBedrooms: boolean
  isAllInclusive: boolean
  isAdultsOnly: boolean
  verified: boolean
  search: string
}

export const Route = createFileRoute('/rankings')({
  component: RankingsPage,
})

function RankingsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('henri_score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    source: 'all',
    minScore: 0,
    maxPrice: 5000,
    hasSeparateBedrooms: false,
    isAllInclusive: false,
    isAdultsOnly: false,
    verified: false,
    search: '',
  })

  useEffect(() => {
    fetch('/unified-properties.json')
      .then((res) => res.json())
      .then((data) => {
        setProperties(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = [...properties]

    // Apply filters
    if (filters.source !== 'all') {
      result = result.filter((p) => p.source === filters.source)
    }
    if (filters.minScore > 0) {
      result = result.filter((p) => (p.henri_score || 0) >= filters.minScore)
    }
    if (filters.maxPrice < 5000) {
      result = result.filter((p) => (p.price_eur || 0) <= filters.maxPrice)
    }
    if (filters.hasSeparateBedrooms) {
      result = result.filter((p) => p.has_separate_bedrooms === true)
    }
    if (filters.isAllInclusive) {
      result = result.filter((p) => p.is_all_inclusive === true)
    }
    if (filters.isAdultsOnly) {
      result = result.filter((p) => p.is_adults_only === true)
    }
    if (filters.verified) {
      result = result.filter((p) => p.verified === true)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(search))
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortKey]
      let bVal = b[sortKey]

      // Handle nulls
      if (aVal === null) aVal = sortDir === 'desc' ? -Infinity : Infinity
      if (bVal === null) bVal = sortDir === 'desc' ? -Infinity : Infinity

      // String comparison for name
      if (sortKey === 'name') {
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal))
      }

      // Numeric comparison
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

    return result
  }, [properties, filters, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 opacity-30" />
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-amber-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-amber-400" />
    )
  }

  const tierColors: Record<string, string> = {
    Excellent: 'text-emerald-400 bg-emerald-500/20',
    'Very Good': 'text-amber-400 bg-amber-500/20',
    Good: 'text-cyan-400 bg-cyan-500/20',
    Average: 'text-slate-400 bg-slate-500/20',
    Poor: 'text-rose-400 bg-rose-500/20',
  }

  const activeFiltersCount = [
    filters.source !== 'all',
    filters.minScore > 0,
    filters.maxPrice < 5000,
    filters.hasSeparateBedrooms,
    filters.isAllInclusive,
    filters.isAdultsOnly,
    filters.verified,
  ].filter(Boolean).length

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
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-amber-400" />
          <div>
            <h1 className="text-xl font-semibold text-white">Property Rankings</h1>
            <p className="text-xs text-slate-400">
              {filteredAndSorted.length} of {properties.length} properties
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search properties..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-48 rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-900">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {/* Source */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-500">Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value as Filters['source'] })}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none"
              >
                <option value="all">All Sources</option>
                <option value="booking">Booking.com</option>
                <option value="airbnb">Airbnb</option>
              </select>
            </div>

            {/* Min Score */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-500">
                Min Score: {filters.minScore}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Max Price */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-500">
                Max Price: €{filters.maxPrice}
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-500">Features</label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={filters.hasSeparateBedrooms}
                    onChange={(e) => setFilters({ ...filters, hasSeparateBedrooms: e.target.checked })}
                    className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30"
                  />
                  2 Bedrooms
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={filters.isAllInclusive}
                    onChange={(e) => setFilters({ ...filters, isAllInclusive: e.target.checked })}
                    className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30"
                  />
                  All-Inclusive
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-500">More</label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={filters.isAdultsOnly}
                    onChange={(e) => setFilters({ ...filters, isAdultsOnly: e.target.checked })}
                    className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30"
                  />
                  Adults Only
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                    className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30"
                  />
                  Verified
                </label>
              </div>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    source: 'all',
                    minScore: 0,
                    maxPrice: 5000,
                    hasSeparateBedrooms: false,
                    isAllInclusive: false,
                    isAdultsOnly: false,
                    verified: false,
                    search: '',
                  })
                }
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500">
                  #
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                  >
                    Property <SortIcon column="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSort('henri_score')}
                    className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                  >
                    Score <SortIcon column="henri_score" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSort('price_eur')}
                    className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                  >
                    Price <SortIcon column="price_eur" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleSort('rating')}
                    className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                  >
                    Rating <SortIcon column="rating" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wider text-slate-500">
                  Features
                </th>
                <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAndSorted.map((property, index) => (
                <tr
                  key={property.id}
                  className="group transition-colors hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      {property.thumbnail_url ? (
                        <img
                          src={property.thumbnail_url}
                          alt=""
                          className="h-10 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-14 rounded-lg bg-slate-800 flex items-center justify-center">
                          <Waves className="h-4 w-4 text-slate-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          to="/property/$id"
                          params={{ id: String(property.id) }}
                          className="truncate text-sm font-medium text-white max-w-[200px] hover:text-amber-400 transition-colors block"
                        >
                          {property.name}
                        </Link>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span
                            className={`rounded px-1.5 py-0.5 uppercase ${
                              property.source === 'booking'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {property.source}
                          </span>
                          {property.verified && (
                            <span className="flex items-center gap-0.5 text-amber-400">
                              <Check className="h-3 w-3" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-lg font-bold text-amber-400">
                        {property.henri_score ?? '—'}
                      </span>
                      {property.henri_tier && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            tierColors[property.henri_tier] || tierColors.Average
                          }`}
                        >
                          {property.henri_tier}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {property.price_eur ? (
                      <span className="text-sm font-medium text-emerald-400">
                        €{property.price_eur.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {property.rating ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {property.rating}
                        </span>
                        {property.review_count && (
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
                            <Users className="h-3 w-3" />
                            {property.review_count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-center gap-1">
                      {property.has_separate_bedrooms && (
                        <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                          <BedDouble className="h-3 w-3" /> 2BR
                        </span>
                      )}
                      {property.is_beachfront && (
                        <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-400">
                          Beach
                        </span>
                      )}
                      {property.is_all_inclusive && (
                        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-400">
                          AI
                        </span>
                      )}
                      {property.is_adults_only && (
                        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-400">
                          18+
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to="/property/$id"
                        params={{ id: String(property.id) }}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-cyan-400 transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-rose-400 transition-colors">
                        <Heart className="h-4 w-4" />
                      </button>
                      {property.source_url && (
                        <a
                          href={property.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-amber-400 transition-colors"
                          title="View on source"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500">
            <Search className="h-8 w-8" />
            <p>No properties match your filters</p>
            <button
              onClick={() =>
                setFilters({
                  source: 'all',
                  minScore: 0,
                  maxPrice: 5000,
                  hasSeparateBedrooms: false,
                  isAllInclusive: false,
                  isAdultsOnly: false,
                  verified: false,
                  search: '',
                })
              }
              className="text-sm text-amber-400 hover:text-amber-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
