import { createFileRoute } from '@tanstack/react-router'
import { getSnapshot } from '../../lib/snapshots'
import { parseCsv } from '../../lib/csv'
import { formatAge, formatNumber } from '../../lib/format'
import { SnapshotEmptyState } from '../../components/report/SnapshotEmptyState'
import { StatsPill } from '../../components/report/StatsPill'

type JiraIssue = {
  key: string
  summary: string
  status: string
  priority: string
  assignee: string
  updated: string
  url: string
  board: string
  project: string
}

export const Route = createFileRoute('/jira/boards')({
  loader: async () => {
    const content = await getSnapshot({ data: { path: 'data/jira_issues.csv' } })
    const table = parseCsv(content)
    const idx = new Map(
      table.headers.map((name, index) => [name.toLowerCase(), index]),
    )

    const issues = table.rows
      .map((row) => {
        const key = row[idx.get('key') ?? 0] ?? ''
        const summary = row[idx.get('summary') ?? 1] ?? ''
        const status = row[idx.get('status') ?? 2] ?? ''
        const priority = row[idx.get('priority') ?? 3] ?? ''
        const assignee = row[idx.get('assignee') ?? 4] ?? ''
        const updated =
          row[idx.get('updated') ?? idx.get('updated_at') ?? 5] ?? ''
        const url = row[idx.get('url') ?? 8] ?? ''
        const board =
          row[idx.get('board') ?? idx.get('board_name') ?? idx.get('project') ?? 6] ??
          ''
        const project = key.split('-')[0] ?? ''
        return {
          key,
          summary,
          status,
          priority,
          assignee,
          updated,
          url,
          board: board || project || 'Unassigned',
          project: project || 'UNK',
        } as JiraIssue
      })
      .filter((issue) => issue.key && issue.summary)

    const sorted = issues.sort(
      (a, b) => Date.parse(b.updated) - Date.parse(a.updated),
    )
    const latestTimestamp = sorted[0]?.updated ?? null

    const byBoard = new Map<string, JiraIssue[]>()
    sorted.forEach((issue) => {
      const board = issue.board || issue.project || 'Unassigned'
      if (!byBoard.has(board)) {
        byBoard.set(board, [])
      }
      if (byBoard.get(board)!.length < 6) {
        byBoard.get(board)!.push(issue)
      }
    })

    const boards = Array.from(byBoard.entries()).map(([name, items]) => ({
      name,
      items,
    }))

    return {
      boards,
      total: issues.length,
      latestTimestamp,
    }
  },
  pendingComponent: JiraBoardsSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: JiraBoardsPage,
})

function JiraBoardsPage() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Jira boards
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white">
            Last active issues by board
          </h1>
          <div className="flex flex-wrap gap-2">
            <StatsPill label="Issues" value={formatNumber(data.total)} />
            <StatsPill
              label="Latest activity"
              value={
                data.latestTimestamp ? `${formatAge(data.latestTimestamp)} ago` : '-'
              }
            />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Recent Jira activity grouped by board with status and priority cues.
        </p>
      </header>

      {data.boards.length === 0 ? (
        <SnapshotEmptyState
          title="Jira issues snapshot missing"
          description="No Jira issues were found in data/jira_issues.csv."
        />
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          {data.boards.map((board) => (
            <div
              key={board.name}
              className="rounded-3xl border border-white/10 bg-slate-950/70 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BoardBadge label={board.name} />
                  <h2 className="text-sm font-semibold text-white">
                    {board.name}
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  {formatNumber(board.items.length)} active
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {board.items.map((issue) => (
                  <a
                    key={`${issue.key}-${issue.updated}`}
                    href={
                      issue.url ||
                      `https://mudid.atlassian.net/browse/${issue.key}`
                    }
                    className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{issue.key}</span>
                      <PriorityBadge priority={issue.priority} />
                    </div>
                    <p className="mt-2 text-sm text-slate-200">
                      {issue.summary}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{issue.assignee || 'Unassigned'}</span>
                      <StatusBadge status={issue.status} />
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">
                      Updated {formatAge(issue.updated)} ago
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const normalized = priority.toLowerCase()
  let className =
    'border-slate-400/30 bg-slate-500/15 text-slate-200'
  if (normalized.includes('highest') || normalized.includes('critical')) {
    className = 'border-rose-400/40 bg-rose-500/15 text-rose-200'
  } else if (normalized.includes('high')) {
    className = 'border-amber-400/40 bg-amber-500/15 text-amber-200'
  } else if (normalized.includes('medium')) {
    className = 'border-sky-400/40 bg-sky-500/15 text-sky-200'
  } else if (normalized.includes('low')) {
    className = 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
  }
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${className}`}
    >
      {priority || 'Unspecified'}
    </span>
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

function BoardBadge({ label }: { label: string }) {
  const palette = [
    'border-cyan-400/40 bg-cyan-500/15 text-cyan-200',
    'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
    'border-violet-400/40 bg-violet-500/15 text-violet-200',
    'border-amber-400/40 bg-amber-500/15 text-amber-200',
    'border-rose-400/40 bg-rose-500/15 text-rose-200',
    'border-sky-400/40 bg-sky-500/15 text-sky-200',
  ]
  let hash = 0
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash + label.charCodeAt(i) * (i + 3)) % palette.length
  }
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${palette[hash]}`}
    >
      {label.slice(0, 4)}
    </span>
  )
}

function JiraBoardsSkeleton() {
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
            key={`board-${idx}`}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
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
