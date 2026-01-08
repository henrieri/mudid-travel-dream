import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Terminal,
  Play,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  listOperations,
  getOperationInfo,
  executeOperation,
  type OperationInfo,
  type OperationsByNamespace,
} from '../lib/x-api'

export const Route = createFileRoute('/x-explorer')({
  loader: async () => {
    const operations = await listOperations({ data: {} })
    return { operations }
  },
  pendingComponent: XExplorerSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: XExplorerPage,
})

function XExplorerPage() {
  const { operations } = Route.useLoaderData()
  const [selectedOp, setSelectedOp] = useState<string | null>(null)
  const [opInfo, setOpInfo] = useState<OperationInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [inputJson, setInputJson] = useState('{}')
  const [result, setResult] = useState<{
    success: boolean
    data?: unknown
    error?: string
    duration?: number
  } | null>(null)
  const [executing, setExecuting] = useState(false)
  const [copied, setCopied] = useState(false)

  const namespaces = Object.keys(operations).sort()

  const handleSelectOperation = async (opName: string) => {
    setSelectedOp(opName)
    setResult(null)
    setLoadingInfo(true)
    setInputJson('{}')

    try {
      const info = await getOperationInfo({ data: { operation: opName } })
      setOpInfo(info ?? null)
    } catch {
      setOpInfo(null)
    } finally {
      setLoadingInfo(false)
    }
  }

  const handleFillExample = () => {
    if (!opInfo?.inputSchema) return

    const example = generateExampleFromSchema(opInfo.inputSchema)
    setInputJson(JSON.stringify(example, null, 2))
  }

  const handleExecute = async () => {
    if (!selectedOp) return

    setExecuting(true)
    const startTime = Date.now()

    try {
      const parsed = JSON.parse(inputJson)
      const response = await executeOperation({
        data: { operation: selectedOp, input: parsed },
      })
      const duration = Date.now() - startTime

      setResult({
        success: response.success,
        data: response.data,
        error: response.error,
        duration,
      })
    } catch (err) {
      const duration = Date.now() - startTime
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        duration,
      })
    } finally {
      setExecuting(false)
    }
  }

  const handleCopyResult = () => {
    if (!result) return
    const text = result.success
      ? JSON.stringify(result.data, null, 2)
      : result.error ?? ''
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Developer tools
        </p>
        <div className="flex items-center gap-3">
          <Terminal className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl font-semibold text-white">x API Explorer</h1>
        </div>
        <p className="text-sm text-slate-400">
          Browse, test, and execute x operations with live results
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Operations List */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Operations
            </h2>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
              {namespaces.map((ns) => (
                <NamespaceGroup
                  key={ns}
                  namespace={ns}
                  operations={operations[ns]}
                  selectedOp={selectedOp}
                  onSelect={handleSelectOperation}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Operation Details & Execution */}
        <main className="space-y-4">
          {!selectedOp ? (
            <EmptyState />
          ) : loadingInfo ? (
            <LoadingState />
          ) : (
            <>
              {/* Operation Info */}
              <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-mono text-lg font-semibold text-white">
                      {selectedOp}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {opInfo?.description ?? 'No description available'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
                    {selectedOp.split('.')[0]}
                  </span>
                </div>

                {opInfo?.inputSchema && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Input Schema
                    </h4>
                    <pre className="overflow-auto rounded-xl bg-slate-900/80 p-3 text-xs text-slate-300 whitespace-pre-wrap break-words">
                      {opInfo.inputSchema}
                    </pre>
                  </div>
                )}

                {opInfo?.outputSchema && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Output Schema
                    </h4>
                    <pre className="overflow-auto rounded-xl bg-slate-900/80 p-3 text-xs text-slate-300 whitespace-pre-wrap break-words">
                      {opInfo.outputSchema}
                    </pre>
                  </div>
                )}
              </section>

              {/* Input & Execute */}
              <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Input JSON
                  </h4>
                  <button
                    type="button"
                    onClick={handleFillExample}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Fill Example
                  </button>
                </div>
                <textarea
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  placeholder="{}"
                  spellCheck={false}
                  className="mt-3 h-32 w-full resize-none rounded-xl border border-white/10 bg-slate-900/80 p-3 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExecute}
                    disabled={executing}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 disabled:opacity-50"
                  >
                    {executing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Execute
                  </button>
                  <span className="text-xs text-slate-500">
                    Press to run the operation
                  </span>
                </div>
              </section>

              {/* Result */}
              {result && (
                <section
                  className={`rounded-2xl border p-5 ${
                    result.success
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                      )}
                      <h4
                        className={`text-sm font-semibold ${result.success ? 'text-emerald-300' : 'text-rose-300'}`}
                      >
                        {result.success ? 'Success' : 'Error'}
                      </h4>
                      {result.duration !== undefined && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-400">
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyResult}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-slate-900/80 p-3 text-xs text-slate-300 whitespace-pre-wrap break-words">
                    {result.success
                      ? JSON.stringify(result.data, null, 2)
                      : result.error}
                  </pre>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function NamespaceGroup({
  namespace,
  operations,
  selectedOp,
  onSelect,
}: {
  namespace: string
  operations: { name: string; description: string }[]
  selectedOp: string | null
  onSelect: (name: string) => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-2 text-left"
      >
        <ChevronRight
          className={`h-3.5 w-3.5 text-slate-500 transition ${expanded ? 'rotate-90' : ''}`}
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {namespace}
        </span>
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">
          {operations.length}
        </span>
      </button>
      {expanded && (
        <ul className="mt-2 space-y-1 pl-5">
          {operations.map((op) => (
            <li key={op.name}>
              <button
                type="button"
                onClick={() => onSelect(op.name)}
                className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                  selectedOp === op.name
                    ? 'bg-cyan-500/20 text-cyan-100'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="font-medium">{op.name.split('.')[1]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/30">
      <div className="text-center">
        <Terminal className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 text-sm text-slate-500">
          Select an operation from the list to get started
        </p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex h-80 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-400" />
        <p className="mt-3 text-sm text-slate-400">Loading operation info...</p>
      </div>
    </div>
  )
}

function XExplorerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-3">
        <div className="h-3 w-32 rounded-full bg-white/10" />
        <div className="h-7 w-56 rounded-full bg-white/10" />
        <div className="h-4 w-80 rounded-full bg-white/10" />
      </header>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="h-96 rounded-2xl bg-white/5" />
        <div className="h-96 rounded-2xl bg-white/5" />
      </div>
    </div>
  )
}

function generateExampleFromSchema(schemaStr: string): Record<string, unknown> {
  try {
    const schema = JSON.parse(schemaStr) as {
      type?: string
      properties?: Record<
        string,
        {
          type?: string
          default?: unknown
          description?: string
          items?: { type?: string }
        }
      >
      required?: string[]
    }

    if (schema.type !== 'object' || !schema.properties) {
      return {}
    }

    const example: Record<string, unknown> = {}
    const required = new Set(schema.required || [])

    for (const [key, prop] of Object.entries(schema.properties)) {
      // Use default value if available
      if (prop.default !== undefined) {
        example[key] = prop.default
        continue
      }

      // Skip optional fields unless they have defaults
      if (!required.has(key)) continue

      // Generate example based on type
      switch (prop.type) {
        case 'string':
          example[key] = key === 'question' ? 'What is mudid?' : `example-${key}`
          break
        case 'number':
        case 'integer':
          example[key] = 1
          break
        case 'boolean':
          example[key] = true
          break
        case 'array':
          example[key] = []
          break
        case 'object':
          example[key] = {}
          break
        default:
          example[key] = null
      }
    }

    return example
  } catch {
    return {}
  }
}
