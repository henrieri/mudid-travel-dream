import {
  Link,
  MatchRoute,
  Outlet,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Gauge,
  LayoutGrid,
  Server,
  ShieldCheck,
  Telescope,
  Search,
  Terminal,
  Boxes,
} from 'lucide-react'
import { formatAge } from '../../lib/format'
import { FilterSelect } from '../report/FilterSelect'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutGrid, exact: true },
  { to: '/timeline', label: 'Timeline', icon: Telescope, exact: true },
  { to: '/timeline/hourly', label: 'Timeline Hourly', icon: Telescope },
  { to: '/prs', label: 'PRs', icon: Activity },
  { to: '/work', label: 'Investigate', icon: Search },
  { to: '/jira/boards', label: 'Jira Boards', icon: ShieldCheck },
  { to: '/nodes', label: 'Nodes', icon: Boxes },
  { to: '/system-health', label: 'System Health', icon: Server },
  { to: '/jira/priority', label: 'Jira Priority', icon: ShieldCheck },
  { to: '/agent-productivity', label: 'Agent Metrics', icon: Gauge },
  { to: '/activities', label: 'Past Activities', icon: Gauge },
  { to: '/reports', label: 'Reports (All)', icon: Telescope },
  { to: '/x-explorer', label: 'x API Explorer', icon: Terminal },
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
  icon: typeof LayoutGrid
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
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.35)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon
        className={`h-4 w-4 ${
          isActive
            ? 'text-cyan-200'
            : 'text-slate-500 group-hover:text-cyan-200'
        }`}
      />
      <span className="flex-1">{label}</span>
      <MatchRoute to={to} pending fuzzy={!exact}>
        <span className="ml-2 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
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
      ? 'Syncing data'
      : status === 'pending'
        ? 'Loading view'
        : ''
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(0)

  const refreshOptions = useMemo(
    () => [
      { label: 'Off', value: 0 },
      { label: '30s', value: 30000 },
      { label: '2m', value: 120000 },
      { label: '5m', value: 300000 },
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
  const isStale = staleMinutes !== null && staleMinutes > 45

  const pageInfo = (() => {
    if (activePathname.startsWith('/timeline/hourly')) {
      return {
        title: 'Hourly Throughput',
        description: '48-hour hourly buckets for Jira, PRs, and commits.',
      }
    }
    if (activePathname.startsWith('/timeline')) {
      return {
        title: 'Timeline Signals',
        description: '48-hour incident and release timeline.',
      }
    }
    if (activePathname.startsWith('/prs')) {
      return {
        title: 'Pull Request Flow',
        description: 'Owner PR activity across Mudid repos.',
      }
    }
    if (activePathname.startsWith('/jira/priority')) {
      return {
        title: 'Jira Priority',
        description: 'Open issues grouped by priority.',
      }
    }
    if (activePathname.startsWith('/jira/boards')) {
      return {
        title: 'Jira Boards',
        description: 'Last active issues grouped by board.',
      }
    }
    if (activePathname.startsWith('/system-health')) {
      return {
        title: 'System Health',
        description: 'CPU, memory, and disk utilization signals.',
      }
    }
    if (activePathname.startsWith('/activities')) {
      return {
        title: 'Past Activities',
        description: 'Recent commits and PR motion.',
      }
    }
    if (activePathname.startsWith('/agent-productivity')) {
      return {
        title: 'Agent Metrics',
        description: 'Automation throughput and delivery momentum.',
      }
    }
    if (activePathname.startsWith('/reports')) {
      return {
        title: 'Snapshot Reports',
        description: 'Markdown summaries and filtered data from snapshots.',
      }
    }
    if (activePathname.startsWith('/work')) {
      return {
        title: 'PR Investigation',
        description: 'Deep dive into pull requests with assets, CI status, and analysis.',
      }
    }
    if (activePathname.startsWith('/x-explorer')) {
      return {
        title: 'x API Explorer',
        description: 'Browse, test, and execute x operations with live results.',
      }
    }
    if (activePathname.startsWith('/nodes')) {
      return {
        title: 'Nodes & Workloads',
        description: 'View pods and services running on each node in your cluster.',
      }
    }
    return {
      title: 'Observatory Overview',
      description: 'Live snapshot intelligence for Mudid infrastructure.',
    }
  })()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div
        className={`pointer-events-none fixed left-0 top-0 z-50 h-0.5 w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-opacity duration-200 ${
          showPending ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-800/80 lg:bg-slate-950">
        <div className="flex items-center gap-3 border-b border-slate-800/80 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">
              TanStack Observatory
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
              Mudid
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600">
            Navigation
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
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            Snapshots streaming
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            x.mudid secured
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/80 px-6 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">
                Mudid Observatory
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
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
              >
                Refresh snapshots
              </button>
              <div
                className={`flex w-[220px] items-center justify-center gap-2 rounded-full border px-3 py-1 text-[11px] ${
                  showPending
                    ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                    : 'border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                <span
                  className={`${
                    showPending
                      ? 'h-2 w-2 animate-pulse rounded-full bg-cyan-300'
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
              <div className="mt-2 rounded-2xl border border-cyan-400/30 bg-slate-950/80 px-4 py-3 text-xs text-cyan-100 shadow-[0_12px_40px_rgba(6,182,212,0.18)] backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                  Loading data...
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
