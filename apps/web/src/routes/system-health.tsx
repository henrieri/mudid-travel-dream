import { createFileRoute } from '@tanstack/react-router'
import { SnapshotEmptyState } from '../components/report/SnapshotEmptyState'
import { StatsPill } from '../components/report/StatsPill'

type Metric = {
  label: string
  value: string
  note: string
  tone: string
}

export const Route = createFileRoute('/system-health')({
  loader: async () => {
    return {
      metrics: [] as Metric[],
      updatedAt: null as string | null,
    }
  },
  pendingComponent: SystemHealthSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: SystemHealthPage,
})

function SystemHealthPage() {
  const data = Route.useLoaderData()
  const hasMetrics = data.metrics.length > 0

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          System health
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white">
            CPU, memory, and disk usage
          </h1>
          <div className="flex flex-wrap gap-2">
            <StatsPill label="Nodes" value="1" />
            <StatsPill label="Last updated" value={data.updatedAt ?? '-'} />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Live infrastructure telemetry will appear here once snapshot exporters
          are wired up.
        </p>
      </header>

      {!hasMetrics ? (
        <SnapshotEmptyState
          title="System telemetry not available"
          description="No CPU, memory, or disk snapshots were found. Add exporters to mudid-snapshot-reports or wire a metrics source."
        />
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          {data.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-3xl border border-white/10 bg-slate-950/70 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  {metric.label}
                </h2>
                <span className={`text-xs ${metric.tone}`}>{metric.note}</span>
              </div>
              <div className="mt-4 text-3xl font-semibold text-white">
                {metric.value}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

function SystemHealthSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-3">
        <div className="h-3 w-40 rounded-full bg-white/10" />
        <div className="h-6 w-72 rounded-full bg-white/10" />
        <div className="h-3 w-80 rounded-full bg-white/10" />
      </header>
      <section className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={`metric-${idx}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mt-4 h-10 w-24 rounded-full bg-white/10" />
          </div>
        ))}
      </section>
    </div>
  )
}
