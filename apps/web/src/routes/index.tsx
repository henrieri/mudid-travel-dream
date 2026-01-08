import { createFileRoute } from '@tanstack/react-router'
import { getSnapshot } from '../lib/snapshots'
import { parseCsv } from '../lib/csv'
import { formatAge, formatNumber } from '../lib/format'

type OpenPr = {
  id: string
  title: string
  repo: string
  url: string
  createdAt: string
}

export const Route = createFileRoute('/')({
  loader: async () => {
    const [ingressesCsv, servicesCsv, openPrsCsv] = await Promise.all([
      getSnapshot({ data: { path: 'data/k8s_ingresses.csv' } }),
      getSnapshot({ data: { path: 'data/k8s_services.csv' } }),
      getSnapshot({ data: { path: 'filtered_data/github_prs_open.csv' } }),
    ])

    const ingresses = parseCsv(ingressesCsv)
    const services = parseCsv(servicesCsv)

    const hostIndex = ingresses.headers.findIndex((header) =>
      ['hosts', 'host', 'domain'].includes(header),
    )
    const ingressDomains = new Set<string>()
    ingresses.rows.forEach((row) => {
      const hostCell = row[hostIndex] ?? ''
      hostCell
        .split(/\s*;\s*|\s*,\s*/g)
        .map((value) => value.trim())
        .filter(Boolean)
        .forEach((value) => ingressDomains.add(value))
    })

    const openPrsTable = parseCsv(openPrsCsv)
    const idx = new Map(
      openPrsTable.headers.map((name, index) => [name, index]),
    )
    const openPrs = openPrsTable.rows
      .map((row) => ({
        id: row[idx.get('id') ?? 0] ?? '',
        title: row[idx.get('title') ?? 1] ?? '',
        repo: row[idx.get('repo') ?? 3] ?? '',
        url: row[idx.get('url') ?? 4] ?? '',
        createdAt: row[idx.get('created_at') ?? 5] ?? '',
      }))
      .filter((row) => row.id && row.url)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 10)

    return {
      ingressDomains: Array.from(ingressDomains).sort(),
      ingressCount: ingresses.rows.length,
      servicesCount: services.rows.length,
      openPrs: openPrs as OpenPr[],
      openPrCount: openPrsTable.rows.length,
    }
  },
  pendingComponent: OverviewSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: OverviewPage,
})

function OverviewPage() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-slate-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Snapshot overview
            </p>
            <h2 className="text-2xl font-semibold text-white">
              Mudid environment pulse
            </h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            Live snapshots • 30 min cadence
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Ingress domains" value={data.ingressDomains.length} />
          <StatCard label="Ingress entries" value={data.ingressCount} />
          <StatCard label="Services tracked" value={data.servicesCount} />
          <StatCard label="Open PRs" value={data.openPrCount} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Ingress domains</h3>
            <span className="text-xs text-slate-500">
              {formatNumber(data.ingressDomains.length)} total
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {data.ingressDomains.length === 0 ? (
              <p className="text-sm text-slate-400">
                No ingress domains detected yet.
              </p>
            ) : (
              data.ingressDomains.map((domain) => (
                <a
                  key={domain}
                  href={`http://${domain}`}
                  className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  {domain}
                </a>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Open PRs</h3>
            <span className="text-xs text-slate-500">
              {formatNumber(data.openPrs.length)} showing
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {data.openPrs.length === 0 ? (
              <p className="text-sm text-slate-400">
                No open PRs detected yet.
              </p>
            ) : (
              data.openPrs.map((pr) => (
                <a
                  key={`${pr.repo}-${pr.id}`}
                  href={pr.url}
                  className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate">{pr.title}</span>
                    <span className="text-xs text-slate-500">
                      {pr.repo}#{pr.id}
                    </span>
                  </div>
                  {pr.createdAt ? (
                    <div className="mt-1 text-xs text-slate-500">
                      Opened {formatAge(pr.createdAt)}
                    </div>
                  ) : null}
                </a>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <h3 className="text-sm font-semibold text-white">Server performance</h3>
        <p className="mt-2 text-sm text-slate-400">
          Metrics API wiring is optional for this experiment. This panel mirrors
          the Observatory layout and can be upgraded to live K8s metrics later.
        </p>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">
        {formatNumber(value)}
      </p>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-32 rounded-full bg-white/10" />
            <div className="h-6 w-64 rounded-full bg-white/10" />
          </div>
          <div className="h-6 w-40 rounded-full bg-white/10" />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`stat-${idx}`}
              className="rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="h-3 w-28 rounded-full bg-white/10" />
              <div className="mt-3 h-6 w-16 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={`panel-${idx}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 rounded-full bg-white/10" />
              <div className="h-3 w-16 rounded-full bg-white/10" />
            </div>
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((__, rowIdx) => (
                <div
                  key={`row-${idx}-${rowIdx}`}
                  className="h-8 rounded-lg bg-white/10"
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="h-4 w-40 rounded-full bg-white/10" />
        <div className="mt-3 h-3 w-3/4 rounded-full bg-white/10" />
      </section>
    </div>
  )
}
