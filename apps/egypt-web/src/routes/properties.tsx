import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Hotel, Star, Users, ExternalLink, ArrowUpDown } from 'lucide-react'

interface Property {
  n: string // name
  p: number | null // price
  r: number | null // rating
  c: number | null // review count
  u: string // url
}

type SortKey = 'n' | 'p' | 'r' | 'c' | 'value'
type SortDir = 'asc' | 'desc'

export const Route = createFileRoute('/properties')({
  component: PropertiesPage,
})

function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('value')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [minRating, setMinRating] = useState(8)
  const [maxPrice, setMaxPrice] = useState(3000)
  const [minReviews, setMinReviews] = useState(100)

  useEffect(() => {
    fetch('/properties.jsonl')
      .then((res) => res.text())
      .then((text) => {
        const lines = text.trim().split('\n')
        const data = lines.map((line) => JSON.parse(line) as Property)
        setProperties(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Calculate value score (rating * log(reviews) / price * 1000)
  const getValue = (p: Property) => {
    if (!p.r || !p.c || !p.p || p.p === 0) return 0
    return (p.r * Math.log10(p.c + 1) * 1000) / p.p
  }

  // Filter and sort
  const filtered = properties.filter((p) => {
    if (p.r !== null && p.r < minRating) return false
    if (p.p !== null && p.p > maxPrice) return false
    if (p.c !== null && p.c < minReviews) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    let aVal: number | string = 0
    let bVal: number | string = 0

    switch (sortKey) {
      case 'n':
        aVal = a.n || ''
        bVal = b.n || ''
        break
      case 'p':
        aVal = a.p ?? 9999999
        bVal = b.p ?? 9999999
        break
      case 'r':
        aVal = a.r ?? 0
        bVal = b.r ?? 0
        break
      case 'c':
        aVal = a.c ?? 0
        bVal = b.c ?? 0
        break
      case 'value':
        aVal = getValue(a)
        bVal = getValue(b)
        break
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'p' ? 'asc' : 'desc')
    }
  }

  const SortHeader = ({
    label,
    sortKeyVal,
  }: {
    label: string
    sortKeyVal: SortKey
  }) => (
    <button
      type="button"
      onClick={() => toggleSort(sortKeyVal)}
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider ${
        sortKey === sortKeyVal ? 'text-amber-400' : 'text-slate-500'
      } hover:text-amber-300`}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading properties...</div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Sharm El Sheikh Feb 2026
        </p>
        <div className="flex items-center gap-3">
          <Hotel className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-semibold text-white">
            All Properties ({properties.length})
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Showing {sorted.length} of {properties.length} properties
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Min Rating:</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-amber-400">{minRating}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Max Price:</label>
          <input
            type="range"
            min="200"
            max="5000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-amber-400">€{maxPrice}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Min Reviews:</label>
          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={minReviews}
            onChange={(e) => setMinReviews(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-amber-400">{minReviews}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Name" sortKeyVal="n" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader label="Price" sortKeyVal="p" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader label="Rating" sortKeyVal="r" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader label="Reviews" sortKeyVal="c" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader label="Value" sortKeyVal="value" />
              </th>
              <th className="px-4 py-3 text-center">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((p, i) => {
              const value = getValue(p)
              const isGoodValue = value > 15
              const isGreatValue = value > 20

              return (
                <tr
                  key={p.u}
                  className="transition hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">#{i + 1}</span>
                      <span className="text-sm text-white">{p.n}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-sm ${p.p && p.p < 1200 ? 'text-emerald-400' : 'text-slate-300'}`}
                    >
                      {p.p ? `€${p.p.toLocaleString()}` : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star
                        className={`h-3 w-3 ${p.r && p.r >= 9 ? 'text-amber-400' : 'text-slate-500'}`}
                      />
                      <span
                        className={`text-sm ${p.r && p.r >= 9 ? 'text-amber-400' : 'text-slate-300'}`}
                      >
                        {p.r ?? '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Users className="h-3 w-3 text-slate-500" />
                      <span className="text-sm text-slate-300">
                        {p.c?.toLocaleString() ?? '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isGreatValue
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isGoodValue
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {value.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={p.u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
