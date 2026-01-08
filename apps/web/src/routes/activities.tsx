import { createFileRoute } from '@tanstack/react-router'
import { getSnapshot } from '../lib/snapshots'
import { parseCsv } from '../lib/csv'
import { formatAge } from '../lib/format'
import { StatsPill } from '../components/report/StatsPill'
import { SnapshotEmptyState } from '../components/report/SnapshotEmptyState'
import { FilterSelect } from '../components/report/FilterSelect'

type ActivityItem = {
  type: 'commit' | 'pr'
  title: string
  subtitle: string
  time: string
  url: string
  repo: string
}

export const Route = createFileRoute('/activities')({
  validateSearch: (search) => ({
    q: typeof search.q === 'string' ? search.q : '',
    repo: typeof search.repo === 'string' ? search.repo : 'all',
    type:
      search.type === 'commit' || search.type === 'pr' ? search.type : 'all',
  }),
  loader: async () => {
    const [commitsCsv, openPrsCsv, overview] = await Promise.all([
      getSnapshot({ data: { path: 'data/github_commits_since_2025.csv' } }),
      getSnapshot({ data: { path: 'filtered_data/github_prs_open.csv' } }),
      getSnapshot({ data: { path: 'reports/overview.md' } }),
    ])

    const commitTable = parseCsv(commitsCsv)
    const prTable = parseCsv(openPrsCsv)

    const commitIdx = new Map(
      commitTable.headers.map((name, index) => [name, index]),
    )
    const prIdx = new Map(
      prTable.headers.map((name, index) => [name, index]),
    )

    const commits = commitTable.rows.map((row) => ({
      type: 'commit' as const,
      title: row[commitIdx.get('message') ?? 4] ?? '',
      subtitle: row[commitIdx.get('author') ?? 3] ?? '',
      time: row[commitIdx.get('date') ?? 2] ?? '',
      url: row[commitIdx.get('url') ?? 5] ?? '',
      repo: row[commitIdx.get('repo') ?? 0] ?? '',
    }))

    const prs = prTable.rows.map((row) => ({
      type: 'pr' as const,
      title: row[prIdx.get('title') ?? 1] ?? '',
      subtitle: row[prIdx.get('repo') ?? 3] ?? '',
      time: row[prIdx.get('created_at') ?? 5] ?? '',
      url: row[prIdx.get('url') ?? 4] ?? '',
      repo: row[prIdx.get('repo') ?? 3] ?? '',
    }))

    const activity = [...commits, ...prs]
      .filter((item) => item.title && item.url)
      .sort((a, b) => (b.time || '').localeCompare(a.time || ''))
      .slice(0, 200)

    const latestTimestamp = activity
      .map((item) => Date.parse(item.time ?? ''))
      .filter((value) => !Number.isNaN(value))
      .reduce((max, value) => Math.max(max, value), 0)

    return {
      overview,
      activity,
      commitCount: commits.length,
      prCount: prs.length,
      latestTimestamp: latestTimestamp ? new Date(latestTimestamp).toISOString() : null,
    }
  },
  pendingComponent: ActivitiesSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: ActivitiesPage,
})

function ActivitiesPage() {
  const { overview, activity, commitCount, prCount, latestTimestamp } =
    Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const repoOptions = Array.from(
    new Set(activity.map((item) => item.repo).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b))
  const query = search.q.trim().toLowerCase()
  const filtered = activity.filter((item) => {
    if (search.type !== 'all' && item.type !== search.type) return false
    if (search.repo !== 'all' && item.repo !== search.repo) return false
    if (!query) return true
    return (
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.repo.toLowerCase().includes(query)
    )
  })
  const visible = filtered.slice(0, 24)

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
          Past activity
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white">
            Recent work across the stack
          </h1>
          <div className="flex flex-wrap gap-2">
            <StatsPill label="Commits" value={`${commitCount}`} />
            <StatsPill label="Open PRs" value={`${prCount}`} />
            <StatsPill
              label="Latest snapshot"
              value={latestTimestamp ? `${formatAge(latestTimestamp)} ago` : '-'}
            />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Fresh snapshot signals for engineers and operators.
        </p>
      </header>

      {activity.length === 0 ? (
        <SnapshotEmptyState
          title="Activity snapshots missing"
          description="No activity data was returned. Check github_commits_since_2025.csv and github_prs_open.csv snapshots."
        />
      ) : null}

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Search
          </span>
          <input
            value={search.q}
            onChange={(event) => updateSearch({ q: event.target.value })}
            placeholder="Filter by title, repo, or author"
            aria-label="Search activity"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <FilterSelect
          ariaLabel="Filter activity by repository"
          label="Repo"
          value={search.repo}
          onChange={(value) => updateSearch({ repo: value })}
          options={[
            { label: 'All', value: 'all' },
            ...repoOptions.map((repo) => ({ label: repo, value: repo })),
          ]}
        />
        <FilterSelect
          ariaLabel="Filter activity by type"
          label="Type"
          value={search.type}
          onChange={(value) =>
            updateSearch({ type: value as 'all' | 'commit' | 'pr' })
          }
          options={[
            { label: 'All', value: 'all' },
            { label: 'Commit', value: 'commit' },
            { label: 'PR', value: 'pr' },
          ]}
        />
        <button
          type="button"
          onClick={() => updateSearch({ q: '', repo: 'all', type: 'all' })}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
        >
          Clear
        </button>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-950/60 to-slate-900/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Activity feed</h2>
            <span className="text-xs text-slate-500">
              Showing {visible.length} of {filtered.length}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400">No activity found.</p>
            ) : (
              visible.map((item) => (
                <a
                  key={`${item.type}-${item.url}`}
                  href={item.url}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate">{item.title}</span>
                    <span className="text-xs text-slate-500">
                      {item.repo}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.subtitle}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        item.type === 'commit'
                          ? 'border-sky-400/40 bg-sky-500/15 text-sky-200'
                          : 'border-violet-400/40 bg-violet-500/15 text-violet-200'
                      }`}
                    >
                      {item.type === 'commit' ? 'Commit' : 'PR'}
                    </span>
                  </div>
                  {item.time ? (
                    <div className="mt-1 text-xs text-slate-500">
                      {formatAge(item.time)} ago
                    </div>
                  ) : null}
                </a>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-sm font-semibold text-white">Overview notes</h2>
          <p className="mt-2 text-xs text-slate-500">
            Snapshot highlights extracted from the latest overview markdown.
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            {overview
              .split('\n')
              .filter((line) => line.startsWith('- '))
              .slice(0, 8)
              .map((line) => (
                <div
                  key={line}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  {line.slice(2)}
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ActivitiesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-3">
        <div className="h-3 w-40 rounded-full bg-white/10" />
        <div className="h-6 w-64 rounded-full bg-white/10" />
        <div className="h-3 w-72 rounded-full bg-white/10" />
      </header>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="h-4 w-32 rounded-full bg-white/10" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={`item-${idx}`} className="h-16 rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="h-4 w-32 rounded-full bg-white/10" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`note-${idx}`} className="h-10 rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
