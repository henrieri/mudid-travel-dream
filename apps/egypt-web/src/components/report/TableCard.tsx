type CsvTable = {
  path: string
  headers: string[]
  rows: string[][]
}

export function TableCard({
  title,
  table,
  caption,
}: {
  title: string
  table: CsvTable
  caption?: string
}) {
  const previewRows = table.rows.slice(0, 20)
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400">{table.rows.length} rows</p>
          {caption ? (
            <p className="mt-1 text-xs text-slate-500">{caption}</p>
          ) : null}
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
          {table.path}
        </span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2 text-left text-xs text-slate-200">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-slate-400">
              {table.headers.map((header) => (
                <th key={header} className="px-2 py-1">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row) => {
              const rowKey = `${title}-${row.join('|')}`
              return (
                <tr key={rowKey} className="rounded-lg bg-white/5">
                  {row.map((cell) => (
                    <td key={`${rowKey}-${cell}`} className="px-2 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {table.rows.length > previewRows.length ? (
        <p className="mt-3 text-xs text-slate-400">
          Showing {previewRows.length} of {table.rows.length} rows.
        </p>
      ) : null}
    </section>
  )
}
