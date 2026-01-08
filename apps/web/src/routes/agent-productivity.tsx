import { createFileRoute } from '@tanstack/react-router'
import { getSnapshot } from '../lib/snapshots'
import { parseCsv } from '../lib/csv'
import { formatAge, formatNumber } from '../lib/format'
import { StatsPill } from '../components/report/StatsPill'

type WindowCounts = {
  label: string
  hours: number
  value: number
}

type SeriesPoint = {
  label: string
  value: number
}

export const Route = createFileRoute('/agent-productivity')({
  loader: async () => {
    const [commitsMainCsv, prsClosedCsv, jiraCsv] = await Promise.all([
      getSnapshot({ data: { path: 'data/github_commits_main.csv' } }),
      getSnapshot({ data: { path: 'filtered_data/github_prs_closed.csv' } }),
      getSnapshot({ data: { path: 'data/jira_issues.csv' } }),
    ])

    const now = Date.now()
    const windows = [
      { label: '24h', hours: 24 },
      { label: '72h', hours: 72 },
      { label: '7d', hours: 24 * 7 },
      { label: '30d', hours: 24 * 30 },
    ]
    const sparklineDays = 14

    const buildDailySeries = (
      rows: string[][],
      dateIndex: number,
      predicate?: (row: string[]) => boolean,
    ) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const earliest = new Date(today)
      earliest.setDate(today.getDate() - (sparklineDays - 1))
      const buckets = new Map<string, number>()

      rows.forEach((row) => {
        if (predicate && !predicate(row)) return
        const parsed = Date.parse(row[dateIndex] ?? '')
        if (Number.isNaN(parsed)) return
        if (parsed < earliest.getTime()) return
        const bucketKey = new Date(parsed).toISOString().slice(0, 10)
        buckets.set(bucketKey, (buckets.get(bucketKey) ?? 0) + 1)
      })

      const series: SeriesPoint[] = []
      for (let i = 0; i < sparklineDays; i += 1) {
        const day = new Date(earliest)
        day.setDate(earliest.getDate() + i)
        const key = day.toISOString().slice(0, 10)
        series.push({
          label: key,
          value: buckets.get(key) ?? 0,
        })
      }
      return series
    }

    const commitsMain = parseCsv(commitsMainCsv)
    const commitDateIndex = commitsMain.headers.findIndex(
      (header) => header === 'date',
    )
    const commitsByWindow = windows.map((window) => ({
      label: window.label,
      hours: window.hours,
      value: commitsMain.rows.filter(
        (row) =>
          Date.parse(row[commitDateIndex] ?? '') >=
          now - window.hours * 60 * 60 * 1000,
      ).length,
    }))
    const commitsSeries = buildDailySeries(
      commitsMain.rows,
      commitDateIndex,
    )

    const prsClosed = parseCsv(prsClosedCsv)
    const closedAtIndex = prsClosed.headers.findIndex(
      (header) => header === 'closed_at',
    )
    const prsByWindow = windows.map((window) => ({
      label: window.label,
      hours: window.hours,
      value: prsClosed.rows.filter(
        (row) =>
          Date.parse(row[closedAtIndex] ?? '') >=
          now - window.hours * 60 * 60 * 1000,
      ).length,
    }))
    const prsSeries = buildDailySeries(prsClosed.rows, closedAtIndex)

    const jiraIssues = parseCsv(jiraCsv)
    const createdIndex = jiraIssues.headers.findIndex(
      (header) => header === 'created',
    )
    const updatedIndex = jiraIssues.headers.findIndex(
      (header) => header === 'updated',
    )
    const statusIndex = jiraIssues.headers.findIndex(
      (header) => header === 'status',
    )

    const jiraCreatedByWindow = windows.map((window) => ({
      label: window.label,
      hours: window.hours,
      value: jiraIssues.rows.filter(
        (row) =>
          Date.parse(row[createdIndex] ?? '') >=
          now - window.hours * 60 * 60 * 1000,
      ).length,
    }))
    const jiraCreatedSeries = buildDailySeries(
      jiraIssues.rows,
      createdIndex,
    )

    const jiraDoneByWindow = windows.map((window) => ({
      label: window.label,
      hours: window.hours,
      value: jiraIssues.rows.filter((row) => {
        if ((row[statusIndex] ?? '') !== 'Done') return false
        return (
          Date.parse(row[updatedIndex] ?? '') >=
          now - window.hours * 60 * 60 * 1000
        )
      }).length,
    }))
    const jiraDoneSeries = buildDailySeries(
      jiraIssues.rows,
      updatedIndex,
      (row) => (row[statusIndex] ?? '') === 'Done',
    )

    const latestTimestamp = [
      commitsMain.rows
        .map((row) => Date.parse(row[commitDateIndex] ?? ''))
        .filter((value) => !Number.isNaN(value))
        .reduce((max, value) => Math.max(max, value), 0),
      prsClosed.rows
        .map((row) => Date.parse(row[closedAtIndex] ?? ''))
        .filter((value) => !Number.isNaN(value))
        .reduce((max, value) => Math.max(max, value), 0),
      jiraIssues.rows
        .map((row) => Date.parse(row[updatedIndex] ?? ''))
        .filter((value) => !Number.isNaN(value))
        .reduce((max, value) => Math.max(max, value), 0),
    ].reduce((max, value) => Math.max(max, value), 0)

    return {
      commitsByWindow,
      prsByWindow,
      jiraCreatedByWindow,
      jiraDoneByWindow,
      commitsSeries,
      prsSeries,
      jiraCreatedSeries,
      jiraDoneSeries,
      latestTimestamp: latestTimestamp ? new Date(latestTimestamp).toISOString() : null,
    }
  },
  pendingComponent: AgentProductivitySkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: AgentProductivityPage,
})

function AgentProductivityPage() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Agent productivity
        </p>
        <h1 className="text-2xl font-semibold text-white">
          Momentum across automation pipelines
        </h1>
        <p className="text-sm text-slate-400">
          Snapshot-derived metrics summarizing PR velocity, commits, and Jira throughput.
        </p>
        <div className="flex flex-wrap gap-2">
          <StatsPill
            label="Latest snapshot"
            value={
              data.latestTimestamp ? `${formatAge(data.latestTimestamp)} ago` : '-'
            }
          />
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <MetricPanel
          title="Commits to main"
          accent="from-sky-500/30 to-sky-300/10"
          rows={data.commitsByWindow}
          series={data.commitsSeries}
          tone="text-sky-300"
        />
        <MetricPanel
          title="PRs closed"
          accent="from-emerald-500/30 to-emerald-300/10"
          rows={data.prsByWindow}
          series={data.prsSeries}
          tone="text-emerald-300"
        />
        <MetricPanel
          title="Jira created"
          accent="from-amber-500/30 to-amber-300/10"
          rows={data.jiraCreatedByWindow}
          series={data.jiraCreatedSeries}
          tone="text-amber-300"
        />
        <MetricPanel
          title="Jira completed"
          accent="from-violet-500/30 to-violet-300/10"
          rows={data.jiraDoneByWindow}
          series={data.jiraDoneSeries}
          tone="text-violet-300"
        />
      </section>
    </div>
  )
}

function MetricPanel({
  title,
  accent,
  rows,
  series,
  tone,
}: {
  title: string
  accent: string
  rows: WindowCounts[]
  series: SeriesPoint[]
  tone: string
}) {
  const max = Math.max(...rows.map((row) => row.value), 1)
  const seriesMax = Math.max(...series.map((point) => point.value), 1)

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <span className="text-xs text-slate-500">
          {formatNumber(rows.reduce((sum, row) => sum + row.value, 0))} total
        </span>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Last 14 days</span>
          <span>{formatNumber(series[series.length - 1]?.value ?? 0)} today</span>
        </div>
        <Sparkline values={series.map((point) => point.value)} tone={tone} />
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-600">
          <span>{series[0]?.label ?? ''}</span>
          <span>{series[series.length - 1]?.label ?? ''}</span>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{row.label}</span>
              <span>{formatNumber(row.value)}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/5">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${accent}`}
                style={{ width: `${Math.round((row.value / max) * 100)}%` }}
              />
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/5">
              <div
                className={`h-1.5 rounded-full ${tone}`}
                style={{
                  width: `${Math.min(100, Math.round((row.value / seriesMax) * 100))}%`,
                  backgroundColor: 'currentColor',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Sparkline({ values, tone }: { values: number[]; tone: string }) {
  if (values.length === 0) return null
  const max = Math.max(...values, 1)
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 100
      const y = 32 - (value / max) * 28 - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className={`mt-2 ${tone}`}>
      <svg viewBox="0 0 100 32" className="h-10 w-full">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
        />
        <polyline
          fill="currentColor"
          opacity="0.15"
          points={`0,32 ${points} 100,32`}
        />
      </svg>
    </div>
  )
}

function AgentProductivitySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-3">
        <div className="h-3 w-40 rounded-full bg-white/10" />
        <div className="h-6 w-72 rounded-full bg-white/10" />
        <div className="h-3 w-80 rounded-full bg-white/10" />
      </header>
      <section className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`panel-${idx}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((__, rowIdx) => (
                <div
                  key={`row-${idx}-${rowIdx}`}
                  className="h-8 rounded-full bg-white/10"
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
