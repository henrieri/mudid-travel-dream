import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Server,
  Container,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  HardDrive,
  Network,
} from 'lucide-react'
import { StatsPill } from '../components/report/StatsPill'
import { FilterSelect } from '../components/report/FilterSelect'
import {
  getNodesWithWorkloads,
  getServices,
  type K8sNodeWithWorkloads,
  type K8sPod,
  type K8sService,
} from '../lib/k8s'

export const Route = createFileRoute('/nodes')({
  validateSearch: (search) => ({
    namespace: typeof search.namespace === 'string' ? search.namespace : 'all',
    status: typeof search.status === 'string' ? search.status : 'all',
  }),
  loader: async () => {
    const [nodesWithPods, services] = await Promise.all([
      getNodesWithWorkloads({ data: {} }),
      getServices({ data: {} }),
    ])

    const namespaces = new Set<string>()
    for (const node of nodesWithPods) {
      for (const pod of node.pods) {
        namespaces.add(pod.namespace)
      }
    }

    return {
      nodes: nodesWithPods,
      services,
      namespaces: ['all', ...Array.from(namespaces).sort()],
    }
  },
  pendingComponent: NodesSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: NodesPage,
})

function NodesPage() {
  const { nodes, services, namespaces } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const totalPods = nodes.reduce((sum, n) => sum + n.podCount, 0)
  const runningPods = nodes.reduce(
    (sum, n) => sum + n.pods.filter((p) => p.status === 'Running').length,
    0
  )

  const filteredNodes = nodes.map((node) => ({
    ...node,
    pods: node.pods.filter((pod) => {
      if (search.namespace !== 'all' && pod.namespace !== search.namespace)
        return false
      if (search.status !== 'all' && pod.status.toLowerCase() !== search.status)
        return false
      return true
    }),
  }))

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
          Cluster topology
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white">
            Nodes & Workloads
          </h1>
          <div className="flex flex-wrap gap-2">
            <StatsPill label="Nodes" value={String(nodes.length)} />
            <StatsPill label="Pods" value={`${runningPods}/${totalPods}`} />
            <StatsPill label="Services" value={String(services.length)} />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          View all pods and services running on each node in your cluster
        </p>
      </header>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
        <FilterSelect
          ariaLabel="Filter by namespace"
          label="Namespace"
          value={search.namespace}
          onChange={(value) => updateSearch({ namespace: value })}
          options={namespaces.map((ns) => ({
            label: ns === 'all' ? 'All namespaces' : ns,
            value: ns,
          }))}
        />
        <FilterSelect
          ariaLabel="Filter by pod status"
          label="Status"
          value={search.status}
          onChange={(value) => updateSearch({ status: value })}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Running', value: 'running' },
            { label: 'Pending', value: 'pending' },
            { label: 'Failed', value: 'failed' },
          ]}
        />
      </section>

      {/* Nodes Grid */}
      <section className="space-y-4">
        {filteredNodes.map((node) => (
          <NodeCard key={node.name} node={node} services={services} />
        ))}
      </section>
    </div>
  )
}

function NodeCard({
  node,
  services,
}: {
  node: K8sNodeWithWorkloads
  services: K8sService[]
}) {
  const [expanded, setExpanded] = useState(true)
  const [showServices, setShowServices] = useState(false)

  const nodeServices = services.filter((s) =>
    node.pods.some((p) => p.namespace === s.namespace)
  )

  const isReady = node.status === 'Ready'
  const runningCount = node.pods.filter((p) => p.status === 'Running').length

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden">
      {/* Node Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <Server className="h-5 w-5 text-cyan-400" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{node.name}</h3>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isReady
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isReady ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {node.status}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-400">
                {node.roles}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Network className="h-3 w-3" />
                {node.internalIp}
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {node.cpu} CPU
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                {node.memory}
              </span>
              <span>{node.version}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {runningCount}/{node.pods.length} pods
            </div>
            <div className="text-xs text-slate-500">Age: {node.age}</div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Pods List */}
      {expanded && (
        <div className="p-4">
          {/* Tabs */}
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setShowServices(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                !showServices
                  ? 'bg-cyan-500/20 text-cyan-100'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Container className="h-3.5 w-3.5" />
              Pods ({node.pods.length})
            </button>
            <button
              type="button"
              onClick={() => setShowServices(true)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                showServices
                  ? 'bg-cyan-500/20 text-cyan-100'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              Services ({nodeServices.length})
            </button>
          </div>

          {!showServices ? (
            node.pods.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/30 p-6 text-center text-sm text-slate-500">
                No pods match the current filters
              </div>
            ) : (
              <div className="space-y-2">
                {node.pods.map((pod) => (
                  <PodRow key={`${pod.namespace}-${pod.name}`} pod={pod} />
                ))}
              </div>
            )
          ) : nodeServices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-slate-900/30 p-6 text-center text-sm text-slate-500">
              No services in namespaces with pods on this node
            </div>
          ) : (
            <div className="space-y-2">
              {nodeServices.map((svc) => (
                <ServiceRow
                  key={`${svc.namespace}-${svc.name}`}
                  service={svc}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PodRow({ pod }: { pod: K8sPod }) {
  const statusColor = {
    Running: 'text-emerald-400',
    Pending: 'text-amber-400',
    Succeeded: 'text-blue-400',
    Failed: 'text-rose-400',
    Unknown: 'text-slate-400',
  }[pod.status] || 'text-slate-400'

  const hasRestarts = parseInt(pod.restarts, 10) > 0

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-900/50 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Container className={`h-4 w-4 shrink-0 ${statusColor}`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-white text-sm">
              {pod.name}
            </span>
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-400">
              {pod.namespace}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
            <span>{pod.containers.length} container(s)</span>
            <span>Ready: {pod.ready}</span>
            {pod.ip !== '-' && <span>IP: {pod.ip}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {hasRestarts && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
            <RefreshCw className="h-3 w-3" />
            {pod.restarts}
          </span>
        )}
        <span className={`text-xs font-medium ${statusColor}`}>
          {pod.status}
        </span>
        <span className="text-xs text-slate-500">{pod.age}</span>
      </div>
    </div>
  )
}

function ServiceRow({ service }: { service: K8sService }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-900/50 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Network className="h-4 w-4 shrink-0 text-blue-400" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-white text-sm">
              {service.name}
            </span>
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-400">
              {service.namespace}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
            <span>Type: {service.type}</span>
            <span>Cluster IP: {service.clusterIp}</span>
            {service.externalIp !== '-' && (
              <span>External: {service.externalIp}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">
          {service.ports}
        </span>
        <span className="text-xs text-slate-500">{service.age}</span>
      </div>
    </div>
  )
}

function NodesSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <header className="space-y-3">
        <div className="h-3 w-32 rounded-full bg-white/10" />
        <div className="h-7 w-56 rounded-full bg-white/10" />
        <div className="h-4 w-80 rounded-full bg-white/10" />
      </header>
      <div className="h-12 rounded-2xl bg-white/5" />
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white/5 p-4">
            <div className="h-16 rounded-xl bg-white/10" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-12 rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
