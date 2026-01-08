export type CsvTable = {
  headers: string[]
  rows: string[][]
}

export function parseCsv(content: string): CsvTable {
  const lines = content.trim().split('\n').filter(Boolean)
  if (lines.length === 0) return { headers: [], rows: [] }
  const splitLine = (line: string) =>
    line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((cell) => {
      const trimmed = cell.trim()
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1).replace(/""/g, '"')
      }
      return trimmed
    })
  const headers = splitLine(lines[0])
  const rows = lines.slice(1).map(splitLine)
  return { headers, rows }
}
