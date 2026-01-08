import { useMemo, useState, type ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getSnapshot, listSnapshots } from '../lib/snapshots'
import { parseCsv } from '../lib/csv'
import { MarkdownBlock } from '../components/Markdown'
import { TableCard } from '../components/report/TableCard'

type CsvTable = {
  path: string
  headers: string[]
  rows: string[][]
}

export const Route = createFileRoute('/reports')({
  loader: async () => {
    const [overview, timeline, filteredList, commitsMain, commitsSince] =
      await Promise.all([
        getSnapshot({ data: { path: 'reports/overview.md' } }),
        getSnapshot({ data: { path: 'reports/timeline_48h.md' } }),
        listSnapshots({ data: { path: 'filtered_data' } }),
        getSnapshot({ data: { path: 'data/github_commits_main.csv' } }),
        getSnapshot({ data: { path: 'data/github_commits_since_2025.csv' } }),
      ])

    const csvFiles =
      filteredList.items
        ?.map((item) => item.path ?? item.name ?? '')
        .filter((path) => path.endsWith('.csv')) ?? []

    const csvTables: CsvTable[] = []
    for (const path of csvFiles) {
      try {
        const content = await getSnapshot({ data: { path } })
        const { headers, rows } = parseCsv(content)
        csvTables.push({ path, headers, rows })
      } catch {
        csvTables.push({ path, headers: [], rows: [] })
      }
    }

    csvTables.sort((a, b) => a.path.localeCompare(b.path))

    const commitsMainTable = {
      path: 'data/github_commits_main.csv',
      ...parseCsv(commitsMain),
    }
    const commitsSinceTable = {
      path: 'data/github_commits_since_2025.csv',
      ...parseCsv(commitsSince),
    }

    return {
      overview,
      timeline,
      csvTables,
      commitsMainTable,
      commitsSinceTable,
    }
  },
  pendingComponent: ReportsSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: ReportsPage,
})

function ReportsPage() {
  const loaderData = Route.useLoaderData()
  const csvTables = loaderData.csvTables as CsvTable[]
  const commitsMainTable = loaderData.commitsMainTable as CsvTable
  const commitsSinceTable = loaderData.commitsSinceTable as CsvTable
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = useMemo(() => {
    const prOpen = csvTables.find((table) =>
      table.path.endsWith('github_prs_open.csv'),
    )
    const prClosed = csvTables.find((table) =>
      table.path.endsWith('github_prs_closed.csv'),
    )
    const jiraStatus = csvTables.filter((table) =>
      table.path.includes('jira_status_'),
    )
    const jiraPriority = csvTables.filter((table) =>
      table.path.includes('jira_open_priority_'),
    )

    return [
      {
        id: 'overview',
        label: 'Overview',
        content: (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-950/50 to-slate-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <h2 className="text-sm font-semibold text-white">Overview</h2>
            <div className="mt-4">
              <MarkdownBlock content={loaderData.overview ?? ''} />
            </div>
          </div>
        ),
      },
      {
        id: 'timeline',
        label: 'Timeline',
        content: (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <h2 className="text-sm font-semibold text-white">Timeline (48h)</h2>
            <div className="mt-4 max-h-[520px] overflow-y-auto pr-2">
              <MarkdownBlock content={loaderData.timeline ?? ''} />
            </div>
          </div>
        ),
      },
      {
        id: 'prs',
        label: 'PRs',
        content: (
          <div className="grid gap-4 lg:grid-cols-2">
            {prOpen ? (
              <TableCard title="Open PRs" table={prOpen} />
            ) : (
              <EmptyCard>Open PRs not available.</EmptyCard>
            )}
            {prClosed ? (
              <TableCard title="Closed PRs" table={prClosed} />
            ) : (
              <EmptyCard>Closed PRs not available.</EmptyCard>
            )}
          </div>
        ),
      },
      {
        id: 'jira-status',
        label: 'Jira Status',
        content: (
          <div className="grid gap-4 lg:grid-cols-2">
            {jiraStatus.length ? (
              jiraStatus.map((table) => (
                <TableCard key={table.path} title={table.path} table={table} />
              ))
            ) : (
              <EmptyCard>Jira status reports not available.</EmptyCard>
            )}
          </div>
        ),
      },
      {
        id: 'jira-priority',
        label: 'Jira Priority',
        content: (
          <div className="grid gap-4 lg:grid-cols-2">
            {jiraPriority.length ? (
              jiraPriority.map((table) => (
                <TableCard key={table.path} title={table.path} table={table} />
              ))
            ) : (
              <EmptyCard>Jira priority reports not available.</EmptyCard>
            )}
          </div>
        ),
      },
      {
        id: 'commits',
        label: 'Commits',
        content: (
          <div className="grid gap-4 lg:grid-cols-2">
            <TableCard title="Commits (main)" table={commitsMainTable} />
            <TableCard
              title="Commits (repos since 2025)"
              table={commitsSinceTable}
            />
          </div>
        ),
      },
    ]
  }, [csvTables, commitsMainTable, commitsSinceTable, loaderData])

  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0]

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Observatory Reports
        </p>
        <h1 className="text-2xl font-semibold text-white">
          Snapshot intelligence
        </h1>
        <p className="text-sm text-slate-400">
          Live summaries and filtered data from mudid-snapshot-reports.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-2">
          {tabs.map((tab) => {
            const isActive = tab.id === active.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.4)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        <div>{active.content}</div>
      </section>
    </div>
  )
}

function EmptyCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-400">
      {children}
    </div>
  )
}

function ReportsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <header className="space-y-2">
        <div className="h-3 w-40 rounded-full bg-white/10" />
        <div className="h-6 w-64 rounded-full bg-white/10" />
        <div className="h-3 w-72 rounded-full bg-white/10" />
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={`tab-${idx}`}
              className="h-8 w-20 rounded-xl bg-white/10"
            />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`card-${idx}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 rounded-full bg-white/10" />
                <div className="h-5 w-24 rounded-full bg-white/10" />
              </div>
              <div className="mt-4 space-y-2">
                {Array.from({ length: 5 }).map((__, rowIdx) => (
                  <div
                    key={`row-${idx}-${rowIdx}`}
                    className="h-8 rounded-lg bg-white/10"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
