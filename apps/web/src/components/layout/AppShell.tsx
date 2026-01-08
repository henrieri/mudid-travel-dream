import {
  Link,
  MatchRoute,
  Outlet,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import {
  Plane,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  Sun,
  Search,
  Palmtree,
} from 'lucide-react'
import { formatAge } from '../../lib/format'
import { FilterSelect } from '../report/FilterSelect'

const NAV_ITEMS = [
  { to: '/', label: 'Destinations', icon: MapPin, exact: true },
  { to: '/trips', label: 'Trip Finder', icon: Calendar },
  { to: '/flights', label: 'Flight Search', icon: Plane },
  { to: '/comparison', label: 'Compare', icon: BarChart3 },
  { to: '/weather', label: 'Weather', icon: Sun },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavLink({
  to,
  label,
  exact,
  icon: Icon,
  onClick,
  isActive,
}: {
  to: string
  label: string
  exact?: boolean
  icon: typeof MapPin
  onClick?: () => void
  isActive: boolean
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      activeOptions={exact ? { exact: true } : undefined}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
        isActive
          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-white shadow-[0_0_0_1px_rgba(251,191,36,0.35)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon
        className={`h-4 w-4 ${
          isActive
            ? 'text-amber-300'
            : 'text-slate-500 group-hover:text-amber-300'
        }`}
      />
      <span className="flex-1">{label}</span>
      <MatchRoute to={to} pending fuzzy={!exact}>
        <span className="ml-2 h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
      </MatchRoute>
    </Link>
  )
}

export default function AppShell() {
  const router = useRouter()
  const { pathname, resolvedPathname, status, isLoading, isTransitioning } =
    useRouterState({
      select: (state) => ({
        pathname: state.location.pathname,
        resolvedPathname: state.resolvedLocation?.pathname,
        status: state.status,
        isLoading: state.isLoading,
        isTransitioning: state.isTransitioning,
      }),
    })
  const activePathname =
    status === 'pending' && resolvedPathname ? resolvedPathname : pathname
  const showPendingRaw = status === 'pending' || isLoading || isTransitioning
  const [showPending, setShowPending] = useState(false)
  const pendingLabel = isTransitioning
    ? 'Transitioning'
    : isLoading
      ? 'Searching flights'
      : status === 'pending'
        ? 'Loading'
        : ''
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(0)

  const refreshOptions = useMemo(
    () => [
      { label: 'Off', value: 0 },
      { label: '5m', value: 300000 },
      { label: '15m', value: 900000 },
      { label: '1h', value: 3600000 },
    ],
    [],
  )

  useEffect(() => {
    const stored = Number(localStorage.getItem('autoRefreshMs') ?? '0')
    if (!Number.isNaN(stored)) {
      setRefreshIntervalMs(stored)
    }
  }, [])

  useEffect(() => {
    if (!showPendingRaw) {
      setLastUpdated(new Date().toISOString())
    }
  }, [showPendingRaw, pathname])

  useEffect(() => {
    if (!showPendingRaw) {
      setShowPending(false)
      return
    }
    const id = window.setTimeout(() => {
      setShowPending(true)
    }, 300)
    return () => window.clearTimeout(id)
  }, [showPendingRaw])

  useEffect(() => {
    if (refreshIntervalMs <= 0) return
    const id = window.setInterval(() => {
      router.invalidate()
    }, refreshIntervalMs)
    return () => window.clearInterval(id)
  }, [refreshIntervalMs, router])

  useEffect(() => {
    localStorage.setItem('autoRefreshMs', String(refreshIntervalMs))
  }, [refreshIntervalMs])

  const staleMinutes = lastUpdated
    ? Math.floor((Date.now() - Date.parse(lastUpdated)) / 60000)
    : null
  const isStale = staleMinutes !== null && staleMinutes > 60

  const pageInfo = (() => {
    if (activePathname.startsWith('/trips')) {
      return {
        title: 'Trip Finder',
        description: 'Find optimal February 2026 trips scored by value.',
      }
    }
    if (activePathname.startsWith('/flights')) {
      return {
        title: 'Flight Search',
        description: 'Search and compare flight options from Tallinn.',
      }
    }
    if (activePathname.startsWith('/comparison')) {
      return {
        title: 'Destination Comparison',
        description: 'Side-by-side comparison of destinations.',
      }
    }
    if (activePathname.startsWith('/weather')) {
      return {
        title: 'Weather Forecast',
        description: 'February weather conditions at destinations.',
      }
    }
    if (activePathname.startsWith('/settings')) {
      return {
        title: 'Settings',
        description: 'Configure trip preferences and scoring weights.',
      }
    }
    return {
      title: 'Destination Rankings',
      description: 'Winter escape destinations scored by experiential value.',
    }
  })()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div
        className={`pointer-events-none fixed left-0 top-0 z-50 h-0.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 shadow-[0_0_10px_rgba(251,191,36,0.8)] transition-opacity duration-200 ${
          showPending ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-800/80 lg:bg-slate-950">
        <div className="flex items-center gap-3 border-b border-slate-800/80 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20">
            <Palmtree className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">
              Travel Dream
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
              February 2026
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600">
            Plan Your Escape
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              {...item}
              isActive={
                item.exact
                  ? activePathname === item.to
                  : activePathname.startsWith(item.to)
              }
            />
          ))}
        </nav>
        <div className="space-y-3 border-t border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            <Plane className="h-3.5 w-3.5 text-amber-400" />
            Henri & Evelina
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Search className="h-3.5 w-3.5" />
            Duffel + Kiwi APIs
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/80 px-6 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
                Travel Dream
              </p>
              <h2 className="text-xl font-semibold text-white">
                {pageInfo.title}
              </h2>
              <p className="text-xs text-slate-400">{pageInfo.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isStale ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                {lastUpdated ? `Updated ${formatAge(lastUpdated)} ago` : 'Fresh'}
                {isStale ? (
                  <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-amber-200">
                    Stale
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] text-slate-500">Auto refresh</span>
              <FilterSelect
                ariaLabel="Auto refresh interval"
                value={String(refreshIntervalMs)}
                onChange={(value) => setRefreshIntervalMs(Number(value))}
                size="sm"
                options={refreshOptions.map((option) => ({
                  label: option.label,
                  value: String(option.value),
                }))}
              />
              <button
                type="button"
                onClick={() => router.invalidate()}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300 transition hover:border-amber-400/40 hover:text-amber-200"
              >
                Refresh
              </button>
              <div
                className={`flex w-[180px] items-center justify-center gap-2 rounded-full border px-3 py-1 text-[11px] ${
                  showPending
                    ? 'border-amber-400/40 bg-amber-500/10 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                    : 'border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                <span
                  className={`${
                    showPending
                      ? 'h-2 w-2 animate-pulse rounded-full bg-amber-300'
                      : 'h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                  }`}
                />
                {showPending ? pendingLabel : 'Ready'}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                {...item}
                isActive={
                  item.exact
                    ? activePathname === item.to
                    : activePathname.startsWith(item.to)
                }
              />
            ))}
          </div>
        </header>

        <main className="relative px-6 py-6">
          <Outlet />
          {showPending && (
            <div className="pointer-events-none absolute inset-0 flex items-start justify-end">
              <div className="mt-2 rounded-2xl border border-amber-400/30 bg-slate-950/80 px-4 py-3 text-xs text-amber-100 shadow-[0_12px_40px_rgba(251,191,36,0.18)] backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
                  Searching...
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
