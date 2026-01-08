import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { listSnapshots, getSnapshot } from '../../lib/snapshots'
import { parseCsv } from '../../lib/csv'
import { formatAge, formatNumber } from '../../lib/format'
import { StatsPill } from '../../components/report/StatsPill'
import { SnapshotEmptyState } from '../../components/report/SnapshotEmptyState'
import { FilterSelect } from '../../components/report/FilterSelect'

type JiraRow = {
  key: string
  summary: string
  status: string
  priority: string
  assignee: string
  url: string
  updated?: string
}

const PRIORITY_LABELS: Record<string, string> = {
  highest: 'Highest',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  unspecified: 'Unspecified',
}

export const Route = createFileRoute('/jira/priority')({
  validateSearch: (search) => ({
    q: typeof search.q === 'string' ? search.q : '',
    project: typeof search.project === 'string' ? search.project : 'all',
    status: typeof search.status === 'string' ? search.status : 'all',
  }),
  loader: async () => {
    const list = await listSnapshots({ data: { path: 'filtered_data' } })
    const files =
      list.items
        ?.map((item) => item.path ?? item.name ?? '')
        .filter((path) => path.includes('jira_open_priority_')) ?? []

    const tables = await Promise.all(
      files.map(async (path) => {
        const content = await getSnapshot({ data: { path } })
        return { path, table: parseCsv(content) }
      }),
    )

    const order = ['Highest', 'High', 'Medium', 'Low', 'Unspecified']
    const columns = tables
      .map(({ path, table }) => {
        const labelKey = path
          .split('jira_open_priority_')[1]
          ?.replace('.csv', '')
        const label = PRIORITY_LABELS[labelKey ?? ''] ?? labelKey ?? path
        const idx = new Map(
          table.headers.map((name, index) => [name.toLowerCase(), index]),
        )
        const rows: JiraRow[] = table.rows.map((row) => ({
          key: row[idx.get('key') ?? 0] ?? '',
          summary: row[idx.get('summary') ?? 1] ?? '',
          status: row[idx.get('status') ?? 2] ?? '',
          priority: row[idx.get('priority') ?? 5] ?? label,
          assignee: row[idx.get('assignee') ?? 3] ?? '',
          url: row[idx.get('url') ?? 8] ?? '',
          updated:
            row[idx.get('updated') ?? idx.get('updated_at') ?? idx.get('created') ?? 0] ??
            '',
        }))
        return {
          label,
          count: rows.length,
          rows,
        }
      })
      .sort(
        (a, b) => order.indexOf(a.label) - order.indexOf(b.label),
      )

    const total = columns.reduce((sum, column) => sum + column.count, 0)
    const latestTimestamp = columns
      .flatMap((column) => column.rows)
      .map((row) => Date.parse(row.updated ?? ''))
      .filter((value) => !Number.isNaN(value))
      .reduce((max, value) => Math.max(max, value), 0)

    return {
      columns,
      total,
      latestTimestamp: latestTimestamp ? new Date(latestTimestamp).toISOString() : null,
    }
  },
  pendingComponent: JiraPrioritySkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: JiraPriorityPage,
})

function JiraPriorityPage() {
  const { columns, total, latestTimestamp } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [savedView, setSavedView] = useState<{
    q: string
    project: string
    status: string
  } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('jiraPriorityView')
    if (stored) {
      try {
        setSavedView(JSON.parse(stored))
      } catch {
        setSavedView(null)
      }
    }
  }, [])

  const allRows = useMemo(
    () => columns.flatMap((column) => column.rows),
    [columns],
  )
  const projects = useMemo(() => {
    const list = Array.from(
      new Set(
        allRows.map((row) => row.key.split('-')[0]).filter(Boolean),
      ),
    )
    return list.sort((a, b) => a.localeCompare(b))
  }, [allRows])
  const statuses = useMemo(() => {
    const list = Array.from(
      new Set(allRows.map((row) => row.status).filter(Boolean)),
    )
    return list.sort((a, b) => a.localeCompare(b))
  }, [allRows])

  const query = search.q.trim().toLowerCase()
  const filteredColumns = columns.map((column) => ({
    ...column,
    rows: column.rows.filter((row) => {
      if (search.project !== 'all') {
        const project = row.key.split('-')[0] ?? ''
        if (project !== search.project) return false
      }
      if (search.status !== 'all') {
        if (row.status.toLowerCase() !== search.status.toLowerCase()) {
          return false
        }
      }
      if (!query) return true
      const haystack = `${row.key} ${row.summary} ${row.assignee}`.toLowerCase()
      return haystack.includes(query)
    }),
  }))

  const filteredTotal = filteredColumns.reduce(
    (sum, column) => sum + column.rows.length,
    0,
  )

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
          Jira priority grid
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white">
            Workstreams by priority
          </h1>
          <div className="flex flex-wrap gap-2">
            <StatsPill label="Total issues" value={formatNumber(total)} />
            <StatsPill
              label="Latest snapshot"
              value={latestTimestamp ? `${formatAge(latestTimestamp)} ago` : '-'}
            />
            {filteredTotal !== total ? (
              <StatsPill
                label="Filtered"
                value={formatNumber(filteredTotal)}
              />
            ) : null}
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Snapshot of open Jira issues bucketed by priority for quick triage.
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
            placeholder="Filter by key, summary, or assignee"
            aria-label="Search Jira issues"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <FilterSelect
          ariaLabel="Filter Jira issues by project"
          label="Project"
          value={search.project}
          onChange={(value) => updateSearch({ project: value })}
          options={[
            { label: 'All', value: 'all' },
            ...projects.map((project) => ({ label: project, value: project })),
          ]}
        />
        <FilterSelect
          ariaLabel="Filter Jira issues by status"
          label="Status"
          value={search.status}
          onChange={(value) => updateSearch({ status: value })}
          options={[
            { label: 'All', value: 'all' },
            ...statuses.map((status) => ({ label: status, value: status })),
          ]}
        />
        <button
          type="button"
          onClick={() => updateSearch({ q: '', project: 'all', status: 'all' })}
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
            onClick={() => updateSearch({ status: 'In Progress' })}
            className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[10px] uppercase tracking-wide text-amber-200"
          >
            In Progress
          </button>
          <button
            type="button"
            onClick={() => updateSearch({ status: 'To Do' })}
            className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[10px] uppercase tracking-wide text-cyan-200"
          >
            To Do
          </button>
          <button
            type="button"
            onClick={() => updateSearch({ status: 'Backlog' })}
            className="rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-[10px] uppercase tracking-wide text-blue-200"
          >
            Backlog
          </button>
          <button
            type="button"
            onClick={() => {
              const payload = {
                q: search.q,
                project: search.project,
                status: search.status,
              }
              localStorage.setItem('jiraPriorityView', JSON.stringify(payload))
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

      {columns.length === 0 ? (
        <SnapshotEmptyState
          title="Jira priority snapshots missing"
          description="No Jira priority CSVs were found under filtered_data. Confirm snapshots are generated for jira_open_priority_*."
        />
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3">
        {filteredColumns.map((column) => (
          <div
            key={column.label}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                {column.label}
              </h2>
              <span className="text-xs text-slate-500">
                {formatNumber(column.count)}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {column.rows.length === 0 ? (
                <p className="text-sm text-slate-400">No issues.</p>
              ) : (
                column.rows.slice(0, 8).map((row) => {
                  const browseUrl = row.key
                    ? `https://mudid.atlassian.net/browse/${row.key}`
                    : row.url
                  return (
                  <a
                    key={`${row.key}-${row.summary}`}
                    href={browseUrl}
                    className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ProjectBadge issueKey={row.key} />
                        <span className="font-medium">{row.key}</span>
                      </div>
                      <StatusBadge status={row.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-200">
                      {row.summary}
                    </p>
                    <div className="mt-2 text-xs text-slate-500">
                      {row.assignee || 'Unassigned'}
                    </div>
                  </a>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

function JiraPrioritySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-3">
        <div className="h-3 w-40 rounded-full bg-white/10" />
        <div className="h-6 w-64 rounded-full bg-white/10" />
        <div className="h-3 w-72 rounded-full bg-white/10" />
      </header>
      <section className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={`col-${idx}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-5"
          >
            <div className="h-4 w-32 rounded-full bg-white/10" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((__, rowIdx) => (
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

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  let className =
    'border-slate-400/30 bg-slate-500/15 text-slate-200'

  if (normalized.includes('backlog')) {
    className = 'border-blue-400/30 bg-blue-500/15 text-blue-200'
  } else if (normalized.includes('to do') || normalized === 'todo') {
    className = 'border-cyan-400/30 bg-cyan-500/15 text-cyan-200'
  } else if (normalized.includes('in progress')) {
    className = 'border-amber-400/30 bg-amber-500/15 text-amber-200'
  } else if (normalized.includes('done')) {
    className = 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
  }

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${className}`}
    >
      {status || 'Unknown'}
    </span>
  )
}

function ProjectBadge({ issueKey }: { issueKey: string }) {
  const project = issueKey.split('-')[0] ?? 'UNK'
  const palette = [
    'border-cyan-400/40 bg-cyan-500/15 text-cyan-200',
    'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
    'border-violet-400/40 bg-violet-500/15 text-violet-200',
    'border-amber-400/40 bg-amber-500/15 text-amber-200',
    'border-rose-400/40 bg-rose-500/15 text-rose-200',
    'border-sky-400/40 bg-sky-500/15 text-sky-200',
    'border-teal-400/40 bg-teal-500/15 text-teal-200',
  ]
  let hash = 0
  for (let i = 0; i < project.length; i += 1) {
    hash = (hash + project.charCodeAt(i) * (i + 1)) % palette.length
  }
  const className = palette[hash] ?? palette[0]

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${className}`}
    >
      {project}
    </span>
  )
}
