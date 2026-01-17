type SnapshotEmptyStateProps = {
  title?: string
  description?: string
}

export function SnapshotEmptyState({
  title = 'Snapshot data missing',
  description = 'Snapshots could not be loaded. Check the mudid-snapshot-reports repo and confirm x.mudid is reachable.',
}: SnapshotEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-200">
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
        Snapshot path: <span className="text-slate-200">mudid-snapshot-reports</span>
      </div>
    </div>
  )
}
