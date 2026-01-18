import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getSnapshot } from '../../lib/snapshots'
import { parseCsv } from '../../lib/csv'
import { formatAge, formatNumber } from '../../lib/format'
import { StatsPill } from '../../components/report/StatsPill'
import { SnapshotEmptyState } from '../../components/report/SnapshotEmptyState'
import { FilterSelect } from '../../components/report/FilterSelect'

export const Route = createFileRoute('/timeline/')({
  validateSearch: (search) => ({
    q: typeof search.q === 'string' ? search.q : '',
    type:
      search.type === 'pr' ||
      search.type === 'jira' ||
      search.type === 'deploy' ||
      search.type === 'other'
        ? search.type
        : 'all',
    repo: typeof search.repo === 'string' ? search.repo : 'all',
  }),
  loader: async () => {
    const [
      timeline,
      commitsMainCsv,
      closedPrsCsv,
      jiraIssuesCsv,
    ] = await Promise.all([
      getSnapshot({ data: { path: 'reports/timeline_48h.md' } }),
      getSnapshot({ data: { path: 'data/github_commits_main.csv' } }),
      getSnapshot({ data: { path: 'filtered_data/github_prs_closed.csv' } }),
      getSnapshot({ data: { path: 'data/jira_issues.csv' } }),
    ])


    const now = Date.now()
    const since24h = now - 24 * 60 * 60 * 1000
    const since7d = now - 7 * 24 * 60 * 60 * 1000

    const commitsMain = parseCsv(commitsMainCsv)
    const commitDateIndex = commitsMain.headers.findIndex(
      (header) => header === 'date',
    )
    const commits24h = commitsMain.rows.filter(
      (row) => Date.parse(row[commitDateIndex] ?? '') >= since24h,
    ).length
    const commits7d = commitsMain.rows.filter(
      (row) => Date.parse(row[commitDateIndex] ?? '') >= since7d,
    ).length

    const closedPrs = parseCsv(closedPrsCsv)
    const closedAtIndex = closedPrs.headers.findIndex(
      (header) => header === 'closed_at',
    )
    const prClosed24h = closedPrs.rows.filter(
      (row) => Date.parse(row[closedAtIndex] ?? '') >= since24h,
    ).length
    const prClosed7d = closedPrs.rows.filter(
      (row) => Date.parse(row[closedAtIndex] ?? '') >= since7d,
    ).length

    const jiraIssues = parseCsv(jiraIssuesCsv)
    const createdIndex = jiraIssues.headers.findIndex(
      (header) => header === 'created',
    )
    const updatedIndex = jiraIssues.headers.findIndex(
      (header) => header === 'updated',
    )
    const statusIndex = jiraIssues.headers.findIndex(
      (header) => header === 'status',
    )
    const jiraCreated24h = jiraIssues.rows.filter(
      (row) => Date.parse(row[createdIndex] ?? '') >= since24h,
    ).length
    const jiraCreated7d = jiraIssues.rows.filter(
      (row) => Date.parse(row[createdIndex] ?? '') >= since7d,
    ).length
    const jiraDone24h = jiraIssues.rows.filter((row) => {
      if ((row[statusIndex] ?? '') !== 'Done') return false
      return Date.parse(row[updatedIndex] ?? '') >= since24h
    }).length
    const jiraDone7d = jiraIssues.rows.filter((row) => {
      if ((row[statusIndex] ?? '') !== 'Done') return false
      return Date.parse(row[updatedIndex] ?? '') >= since7d
    }).length

    const lines = timeline
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => (line.startsWith('- ') ? line.slice(2) : line))

    const events = lines
      .map((line) => {
        const match = line.match(
          /^(\d{4}-\d{2}-\d{2}T[^\s]+)\s+(.*)$/i,
        )
        if (!match) return null
        const timestamp = match[1]
        const detail = match[2]
        const type = getEventType(detail)
        return {
          timestamp,
          detail,
          type,
          time: Date.parse(timestamp),
          repo: extractRepo(detail),
        }
      })
      .filter((event): event is NonNullable<typeof event> => Boolean(event))
      .sort((a, b) => b.time - a.time)
    return {
      eventCount: events.length,
      events,
      latestTimestamp: events[0]?.timestamp ?? null,
      metrics: {
        prClosed24h,
        prClosed7d,
        jiraCreated24h,
        jiraCreated7d,
        jiraDone24h,
        jiraDone7d,
        commits24h,
        commits7d,
      },
    }
  },
  pendingComponent: TimelineSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: TimelinePage,
})

function TimelinePage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [savedView, setSavedView] = useState<{
    q: string
    type: string
    repo: string
  } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('timelineView')
    if (stored) {
      try {
        setSavedView(JSON.parse(stored))
      } catch {
        setSavedView(null)
      }
    }
  }, [])

  const query = search.q.trim().toLowerCase()
  const repoOptions = useMemo(() => {
    const list = Array.from(
      new Set(data.events.map((event) => event.repo).filter(Boolean)),
    )
    return list.sort((a, b) => a.localeCompare(b))
  }, [data.events])
  const filteredEvents = data.events.filter((event) => {
    if (search.type !== 'all' && event.type !== search.type) return false
    if (search.repo !== 'all' && event.repo !== search.repo) return false
    if (!query) return true
    return event.detail.toLowerCase().includes(query)
  })

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
          Snapshot timeline
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white">
            Last 48 hours signal
          </h1>
          <div className="flex flex-wrap gap-2">
            <StatsPill
              label="Events"
              value={formatNumber(filteredEvents.length)}
            />
            <StatsPill
              label="Latest snapshot"
              value={
                data.latestTimestamp
                  ? `${formatAge(data.latestTimestamp)} ago`
                  : '-'
              }
            />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Curated from the latest timeline snapshot for rapid incident scanning.
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
            placeholder="Filter events by keyword"
            aria-label="Search timeline events"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <FilterSelect
          ariaLabel="Filter timeline by event type"
          label="Type"
          value={search.type}
          onChange={(value) =>
            updateSearch({
              type: value as 'all' | 'pr' | 'jira' | 'deploy' | 'other',
            })
          }
          options={[
            { label: 'All', value: 'all' },
            { label: 'PR', value: 'pr' },
            { label: 'Jira', value: 'jira' },
            { label: 'Deploy', value: 'deploy' },
            { label: 'Other', value: 'other' },
          ]}
        />
        <FilterSelect
          ariaLabel="Filter timeline by repo"
          label="Repo"
          value={search.repo}
          onChange={(value) => updateSearch({ repo: value })}
          options={[
            { label: 'All', value: 'all' },
            ...repoOptions.map((repo) => ({ label: repo, value: repo })),
          ]}
        />
        <button
          type="button"
          onClick={() => updateSearch({ q: '', type: 'all', repo: 'all' })}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
        >
          Clear
        </button>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="uppercase tracking-[0.2em] text-slate-500">
            Quick views
          </span>
          <button
            type="button"
            onClick={() => updateSearch({ type: 'pr' })}
            className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-wide text-emerald-200"
          >
            PRs
          </button>
          <button
            type="button"
            onClick={() => updateSearch({ type: 'jira' })}
            className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[10px] uppercase tracking-wide text-amber-200"
          >
            Jira
          </button>
          <button
            type="button"
            onClick={() => updateSearch({ type: 'deploy' })}
            className="rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-[10px] uppercase tracking-wide text-sky-200"
          >
            Deploys
          </button>
          <button
            type="button"
            onClick={() => {
              const payload = {
                q: search.q,
                type: search.type,
                repo: search.repo,
              }
              localStorage.setItem('timelineView', JSON.stringify(payload))
              setSavedView(payload)
            }}
            className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-wide text-emerald-200"
          >
            Save view
          </button>
          {savedView ? (
            <button
              type="button"
              onClick={() => updateSearch(savedView)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wide text-slate-200"
            >
              Saved view
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <MetricCard
          title="PRs closed"
          note="Proxy for merged activity"
          day={data.metrics.prClosed24h}
          week={data.metrics.prClosed7d}
          tone="emerald"
        />
        <MetricCard
          title="Commits to main"
          day={data.metrics.commits24h}
          week={data.metrics.commits7d}
          tone="sky"
        />
        <MetricCard
          title="Jira created"
          day={data.metrics.jiraCreated24h}
          week={data.metrics.jiraCreated7d}
          tone="amber"
        />
        <MetricCard
          title="Jira completed"
          note="Status = Done"
          day={data.metrics.jiraDone24h}
          week={data.metrics.jiraDone7d}
          tone="violet"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-950/50 to-slate-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Event stream</h2>
            <span className="text-xs text-slate-500">Newest first</span>
          </div>
          <div className="mt-5 space-y-3">
            {filteredEvents.length === 0 ? (
              <SnapshotEmptyState
                title="No timeline events"
                description="The timeline snapshot is empty or unavailable. Confirm snapshots are generated and x.local is online."
              />
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={`${event.timestamp}-${event.detail}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${eventTypeDot(
                          event.type,
                        )}`}
                      />
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {event.type}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatAge(event.timestamp)} ago
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-200">
                    {renderEventDetail(event.detail)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-sm font-semibold text-white">Latest highlights</h2>
          <p className="mt-2 text-xs text-slate-500">
            A quick skim of the most recent signals.
          </p>
          <div className="mt-5 space-y-4">
            {filteredEvents.length === 0 ? (
              <p className="text-xs text-slate-500">
                Highlights will appear once events are available.
              </p>
            ) : (
              filteredEvents.slice(0, 10).map((event) => (
                <div
                  key={`highlight-${event.timestamp}-${event.detail}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {event.type}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatAge(event.timestamp)} ago
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-200">
                    {renderEventDetail(event.detail)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-3">
        <div className="h-3 w-40 rounded-full bg-white/10" />
        <div className="h-6 w-64 rounded-full bg-white/10" />
        <div className="h-3 w-72 rounded-full bg-white/10" />
      </header>
      <section className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`metric-${idx}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mt-4 h-10 rounded-2xl bg-white/10" />
          </div>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={`panel-${idx}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((__, rowIdx) => (
                <div
                  key={`row-${idx}-${rowIdx}`}
                  className="h-12 rounded-2xl bg-white/10"
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

type EventType = 'pr' | 'jira' | 'deploy' | 'other'

function getEventType(detail: string): EventType {
  if (/^PR /i.test(detail)) return 'pr'
  if (/^Jira /i.test(detail)) return 'jira'
  if (/deploy|rollout|release/i.test(detail)) return 'deploy'
  return 'other'
}

function eventTypeDot(type: EventType) {
  switch (type) {
    case 'pr':
      return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
    case 'jira':
      return 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
    case 'deploy':
      return 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]'
    default:
      return 'bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.6)]'
  }
}

function renderEventDetail(detail: string) {
  const parts: React.ReactNode[] = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while (true) {
    match = regex.exec(detail)
    if (!match) break
    if (match.index > lastIndex) {
      parts.push(detail.slice(lastIndex, match.index))
    }
    parts.push(
      <a
        key={`${match[1]}-${match[2]}-${match.index}`}
        href={match[2]}
        className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
        target="_blank"
        rel="noreferrer"
      >
        {match[1]}
      </a>,
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < detail.length) {
    parts.push(detail.slice(lastIndex))
  }
  return <>{parts}</>
}

function extractRepo(detail: string) {
  const match = detail.match(/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/)
  return match?.[1] ?? ''
}

function MetricCard({
  title,
  note,
  day,
  week,
  tone,
}: {
  title: string
  note?: string
  day: number
  week: number
  tone: 'emerald' | 'sky' | 'amber' | 'violet'
}) {
  const max = Math.max(day, week, 1)
  const dayPct = Math.round((day / max) * 100)
  const weekPct = Math.round((week / max) * 100)
  const toneMap = {
    emerald: 'from-emerald-500/40 to-emerald-300/20',
    sky: 'from-sky-500/40 to-sky-300/20',
    amber: 'from-amber-500/40 to-amber-300/20',
    violet: 'from-violet-500/40 to-violet-300/20',
  } as const

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {note ? <p className="text-xs text-slate-500">{note}</p> : null}
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>24h: {day}</div>
          <div>7d: {week}</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <MetricBar
          label="24h"
          value={day}
          percent={dayPct}
          tone={toneMap[tone]}
        />
        <MetricBar
          label="7d"
          value={week}
          percent={weekPct}
          tone={toneMap[tone]}
        />
      </div>
    </div>
  )
}

function MetricBar({
  label,
  value,
  percent,
  tone,
}: {
  label: string
  value: number
  percent: number
  tone: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/5">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${tone}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
