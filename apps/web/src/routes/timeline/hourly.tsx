import { createFileRoute } from '@tanstack/react-router'
import { getSnapshot } from '../../lib/snapshots'
import { parseCsv } from '../../lib/csv'
import { formatNumber } from '../../lib/format'
import { SnapshotEmptyState } from '../../components/report/SnapshotEmptyState'
import { StatsPill } from '../../components/report/StatsPill'

type HourBucket = {
  label: string
  timestamp: number
  value: number
}

type Series = {
  title: string
  tone: string
  buckets: HourBucket[]
  total: number
}

export const Route = createFileRoute('/timeline/hourly')({
  loader: async () => {
    const [commitsMainCsv, closedPrsCsv, jiraIssuesCsv] = await Promise.all([
      getSnapshot({ data: { path: 'data/github_commits_main.csv' } }),
      getSnapshot({ data: { path: 'filtered_data/github_prs_closed.csv' } }),
      getSnapshot({ data: { path: 'data/jira_issues.csv' } }),
    ])

    const now = new Date()
    now.setMinutes(0, 0, 0)
    const hours = 48
    const start = new Date(now)
    start.setHours(start.getHours() - (hours - 1))

    const bucketize = (rows: string[][], dateIndex: number, predicate?: (row: string[]) => boolean) => {
      const buckets = new Map<number, number>()
      rows.forEach((row) => {
        if (predicate && !predicate(row)) return
        const parsed = Date.parse(row[dateIndex] ?? '')
        if (Number.isNaN(parsed)) return
        if (parsed < start.getTime()) return
        const rounded = new Date(parsed)
        rounded.setMinutes(0, 0, 0)
        const key = rounded.getTime()
        buckets.set(key, (buckets.get(key) ?? 0) + 1)
      })

      const results: HourBucket[] = []
      for (let i = 0; i < hours; i += 1) {
        const slot = new Date(start)
        slot.setHours(start.getHours() + i)
        const key = slot.getTime()
        results.push({
          label: slot.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
          }),
          timestamp: key,
          value: buckets.get(key) ?? 0,
        })
      }
      return results
    }

    const commitsMain = parseCsv(commitsMainCsv)
    const commitDateIndex = commitsMain.headers.findIndex(
      (header) => header === 'date',
    )
    const commitBuckets = bucketize(commitsMain.rows, commitDateIndex)

    const closedPrs = parseCsv(closedPrsCsv)
    const closedAtIndex = closedPrs.headers.findIndex(
      (header) => header === 'closed_at',
    )
    const prBuckets = bucketize(closedPrs.rows, closedAtIndex)

    const jiraIssues = parseCsv(jiraIssuesCsv)
    const updatedIndex = jiraIssues.headers.findIndex(
      (header) => header === 'updated',
    )
    const statusIndex = jiraIssues.headers.findIndex(
      (header) => header === 'status',
    )
    const jiraBuckets = bucketize(
      jiraIssues.rows,
      updatedIndex,
      (row) => (row[statusIndex] ?? '') === 'Done',
    )

    const makeSeries = (title: string, tone: string, buckets: HourBucket[]): Series => ({
      title,
      tone,
      buckets,
      total: buckets.reduce((sum, bucket) => sum + bucket.value, 0),
    })

    return {
      start: start.toISOString(),
      end: now.toISOString(),
      series: [
        makeSeries('PRs closed', 'emerald', prBuckets),
        makeSeries('Commits to main', 'sky', commitBuckets),
        makeSeries('Jira done', 'amber', jiraBuckets),
      ],
    }
  },
  pendingComponent: HourlyTimelineSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: HourlyTimelinePage,
})

function HourlyTimelinePage() {
  const data = Route.useLoaderData()

  const totalEvents = data.series.reduce((sum, series) => sum + series.total, 0)
  const allBuckets = data.series.flatMap((series) => series.buckets)
  const hasData = allBuckets.some((bucket) => bucket.value > 0)

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Hourly throughput
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white">
            48-hour hourly buckets
          </h1>
          <div className="flex flex-wrap gap-2">
            <StatsPill label="Total events" value={formatNumber(totalEvents)} />
            <StatsPill
              label="Window"
              value={`${new Date(data.start).toLocaleDateString()} → ${new Date(
                data.end,
              ).toLocaleDateString()}`}
            />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Hourly rollups for Jira Done, PRs closed, and commits to main.
        </p>
      </header>

      {!hasData ? (
        <SnapshotEmptyState
          title="No hourly activity found"
          description="No events were detected in the last 48 hours. Confirm snapshots are fresh."
        />
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          {data.series.map((series) => (
            <HourlyChart key={series.title} series={series} />
          ))}
        </section>
      )}
    </div>
  )
}

function HourlyChart({ series }: { series: Series }) {
  const max = Math.max(...series.buckets.map((bucket) => bucket.value), 1)
  const chartHeight = 176
  const toneMap: Record<string, string> = {
    emerald: 'from-emerald-400/90 to-emerald-200/20',
    sky: 'from-sky-400/90 to-sky-200/20',
    amber: 'from-amber-400/90 to-amber-200/20',
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">{series.title}</h2>
        <span className="text-xs text-slate-500">
          {formatNumber(series.total)} total
        </span>
      </div>
      <div className="relative mt-5 flex h-44 items-end gap-1">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10" />
        {series.buckets.map((bucket) => {
          const heightPx =
            bucket.value === 0
              ? 2
              : Math.max(
                  6,
                  Math.round((bucket.value / max) * chartHeight),
                )
          return (
          <div key={bucket.timestamp} className="group relative flex-1">
            <div
              className={`w-full rounded-full bg-gradient-to-t ${toneMap[series.tone]} shadow-[0_0_12px_rgba(34,211,238,0.18)] transition`}
              style={{ height: `${heightPx}px` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-32 -translate-x-1/2 rounded-xl border border-white/10 bg-slate-950/90 px-2 py-1 text-[10px] text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.4)] group-hover:block">
              <div className="text-slate-400">{bucket.label}</div>
              <div className="text-sm text-white">
                {formatNumber(bucket.value)} events
              </div>
            </div>
          </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-600">
        <span>{series.buckets[0]?.label ?? ''}</span>
        <span>{series.buckets[series.buckets.length - 1]?.label ?? ''}</span>
      </div>
    </div>
  )
}

function HourlyTimelineSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-3">
        <div className="h-3 w-40 rounded-full bg-white/10" />
        <div className="h-6 w-64 rounded-full bg-white/10" />
        <div className="h-3 w-72 rounded-full bg-white/10" />
      </header>
      <section className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={`panel-${idx}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mt-5 h-40 rounded-2xl bg-white/10" />
          </div>
        ))}
      </section>
    </div>
  )
}
