import { createFileRoute } from '@tanstack/react-router'
import { getSnapshot } from '../lib/snapshots'
import { parseCsv } from '../lib/csv'
import { formatAge, formatNumber } from '../lib/format'
import { StatsPill } from '../components/report/StatsPill'
import { SnapshotEmptyState } from '../components/report/SnapshotEmptyState'
import { FilterSelect } from '../components/report/FilterSelect'

type PullRequest = {
  id: string
  title: string
  repo: string
  url: string
  createdAt: string
  closedAt?: string
}

export const Route = createFileRoute('/prs')({
  validateSearch: (search) => ({
    q: typeof search.q === 'string' ? search.q : '',
    repo: typeof search.repo === 'string' ? search.repo : 'all',
    state:
      search.state === 'open' || search.state === 'closed'
        ? search.state
        : 'all',
  }),
  loader: async () => {
    const [openCsv, closedCsv] = await Promise.all([
      getSnapshot({ data: { path: 'filtered_data/github_prs_open.csv' } }),
      getSnapshot({ data: { path: 'filtered_data/github_prs_closed.csv' } }),
    ])

    const openTable = parseCsv(openCsv)
    const closedTable = parseCsv(closedCsv)

    const mapRows = (table: { headers: string[]; rows: string[][] }) => {
      const idx = new Map(
        table.headers.map((name, index) => [name, index]),
      )
      return table.rows
        .map((row) => ({
          id: row[idx.get('id') ?? 0] ?? '',
          title: row[idx.get('title') ?? 1] ?? '',
          repo: row[idx.get('repo') ?? 3] ?? '',
          url: row[idx.get('url') ?? 4] ?? '',
          createdAt: row[idx.get('created_at') ?? 5] ?? '',
          closedAt: row[idx.get('closed_at') ?? 6] ?? '',
        }))
        .filter((row) => row.id && row.url)
    }

    const openPrs = mapRows(openTable).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || ''),
    )
    const closedPrs = mapRows(closedTable).sort((a, b) =>
      (b.closedAt || b.createdAt || '').localeCompare(
        a.closedAt || a.createdAt || '',
      ),
    )

    const latestTimestamp = [...openPrs, ...closedPrs]
      .map((pr) => pr.closedAt || pr.createdAt)
      .map((value) => Date.parse(value ?? ''))
      .filter((value) => !Number.isNaN(value))
      .reduce((max, value) => Math.max(max, value), 0)

    return {
      openPrs,
      closedPrs,
      latestTimestamp: latestTimestamp ? new Date(latestTimestamp).toISOString() : null,
    }
  },
  pendingComponent: PrsSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: PrsPage,
})

function PrsPage() {
  const { openPrs, closedPrs, latestTimestamp } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const repoOptions = Array.from(
    new Set([...openPrs, ...closedPrs].map((pr) => pr.repo).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b))
  const query = search.q.trim().toLowerCase()
  const matchesFilters = (pr: PullRequest) => {
    if (search.repo !== 'all' && pr.repo !== search.repo) return false
    if (!query) return true
    return (
      pr.title.toLowerCase().includes(query) ||
      pr.repo.toLowerCase().includes(query) ||
      pr.id.toLowerCase().includes(query)
    )
  }

  const filteredOpen =
    search.state === 'closed' ? [] : openPrs.filter(matchesFilters)
  const filteredClosed =
    search.state === 'open' ? [] : closedPrs.filter(matchesFilters)
  const showEmptyState = openPrs.length === 0 && closedPrs.length === 0

  const updateSearch = (patch: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    })
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Pull request pulse
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white">
            Open and recently closed PRs
          </h1>
          <div className="flex flex-wrap gap-2">
            <StatsPill label="Open" value={formatNumber(filteredOpen.length)} />
            <StatsPill
              label="Closed"
              value={formatNumber(filteredClosed.length)}
            />
            <StatsPill
              label="Latest snapshot"
              value={latestTimestamp ? `${formatAge(latestTimestamp)} ago` : '-'}
            />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Owner-focused PR stream to keep the pipeline moving.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Search
          </span>
          <input
            value={search.q}
            onChange={(event) => updateSearch({ q: event.target.value })}
            placeholder="Filter by title, repo, or ID"
            aria-label="Search pull requests"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <FilterSelect
          ariaLabel="Filter pull requests by repository"
          label="Repo"
          value={search.repo}
          onChange={(value) => updateSearch({ repo: value })}
          options={[
            { label: 'All', value: 'all' },
            ...repoOptions.map((repo) => ({ label: repo, value: repo })),
          ]}
        />
        <FilterSelect
          ariaLabel="Filter pull requests by state"
          label="State"
          value={search.state}
          onChange={(value) =>
            updateSearch({ state: value as 'all' | 'open' | 'closed' })
          }
          options={[
            { label: 'All', value: 'all' },
            { label: 'Open', value: 'open' },
            { label: 'Closed', value: 'closed' },
          ]}
        />
        <button
          type="button"
          onClick={() => updateSearch({ q: '', repo: 'all', state: 'all' })}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
        >
          Clear
        </button>
      </section>

      {showEmptyState ? (
        <SnapshotEmptyState
          title="PR snapshots unavailable"
          description="No PR snapshot data was found. Ensure filtered_data/github_prs_open.csv and github_prs_closed.csv exist in mudid-snapshot-reports."
        />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        {search.state !== 'closed' ? (
          <PrSection
            title="Open PRs"
            items={filteredOpen}
            accent="from-cyan-500/20"
          />
        ) : null}
        {search.state !== 'open' ? (
          <PrSection
            title="Recently closed"
            items={filteredClosed.slice(0, 12)}
            accent="from-emerald-500/20"
            closed
          />
        ) : null}
      </section>
    </div>
  )
}

function PrSection({
  title,
  items,
  accent,
  closed,
}: {
  title: string
  items: PullRequest[]
  accent: string
  closed?: boolean
}) {
  const badgeClass = closed
    ? 'border-rose-400/30 bg-rose-500/15 text-rose-200'
    : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-gradient-to-br ${accent} via-slate-950/70 to-slate-950/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <span className="text-xs text-slate-500">
          {formatNumber(items.length)} items
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No PRs found.</p>
        ) : (
          items.slice(0, 12).map((pr) => (
            <a
              key={`${pr.repo}-${pr.id}-${pr.title}`}
              href={pr.url}
              className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
              target="_blank"
              rel="noreferrer"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="truncate">{pr.title}</span>
                <span className="text-xs text-slate-500">
                  {pr.repo}#{pr.id}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {closed && pr.closedAt
                    ? `Closed ${formatAge(pr.closedAt)}`
                    : `Opened ${formatAge(pr.createdAt)}`}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${badgeClass}`}
                >
                  {closed ? 'Closed' : 'Open'}
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}

function PrsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-3">
        <div className="h-3 w-40 rounded-full bg-white/10" />
        <div className="h-6 w-72 rounded-full bg-white/10" />
        <div className="h-3 w-64 rounded-full bg-white/10" />
      </header>
      <section className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={`col-${idx}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((__, rowIdx) => (
                <div
                  key={`row-${idx}-${rowIdx}`}
                  className="h-16 rounded-2xl bg-white/10"
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
