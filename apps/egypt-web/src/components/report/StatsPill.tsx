export function StatsPill({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
      <span className="text-slate-500">{label}</span>
      <span className="ml-2 text-white">{value}</span>
    </div>
  )
}
