import { createServerFn } from '@tanstack/react-start'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export type K8sNode = {
  name: string
  status: string
  roles: string
  age: string
  version: string
  internalIp: string
  osImage: string
  containerRuntime: string
  cpu: string
  memory: string
}

export type K8sPod = {
  name: string
  namespace: string
  status: string
  restarts: string
  age: string
  ip: string
  node: string
  containers: string[]
  ready: string
}

export type K8sService = {
  name: string
  namespace: string
  type: string
  clusterIp: string
  externalIp: string
  ports: string
  age: string
}

export type K8sNodeWithWorkloads = K8sNode & {
  pods: K8sPod[]
  podCount: number
}

async function kubectl(args: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`kubectl ${args}`, {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    })
    return stdout.trim()
  } catch (error) {
    const err = error as { stderr?: string; message?: string }
    throw new Error(err.stderr || err.message || 'kubectl command failed')
  }
}

export const getNodes = createServerFn({ method: 'POST' })
  .inputValidator((input: Record<string, never>) => input)
  .handler(async (): Promise<K8sNode[]> => {
    const output = await kubectl(
      'get nodes -o jsonpath=\'{range .items[*]}{.metadata.name}|{.status.conditions[?(@.type=="Ready")].status}|{.metadata.labels.node-role\\.kubernetes\\.io/master}|{.metadata.creationTimestamp}|{.status.nodeInfo.kubeletVersion}|{.status.addresses[?(@.type=="InternalIP")].address}|{.status.nodeInfo.osImage}|{.status.nodeInfo.containerRuntimeVersion}|{.status.capacity.cpu}|{.status.capacity.memory}{"\\n"}{end}\''
    )

    const nodes: K8sNode[] = []
    const lines = output.split('\n').filter(Boolean)

    for (const line of lines) {
      const parts = line.split('|')
      if (parts.length < 10) continue

      const createdAt = new Date(parts[3])
      const age = formatAge(createdAt)

      nodes.push({
        name: parts[0],
        status: parts[1] === 'True' ? 'Ready' : 'NotReady',
        roles: parts[2] ? 'control-plane' : 'worker',
        age,
        version: parts[4],
        internalIp: parts[5],
        osImage: parts[6],
        containerRuntime: parts[7],
        cpu: parts[8],
        memory: formatMemory(parts[9]),
      })
    }

    return nodes
  })

export const getPods = createServerFn({ method: 'POST' })
  .inputValidator((input: { namespace?: string }) => input)
  .handler(async ({ data }): Promise<K8sPod[]> => {
    const nsFlag = data?.namespace ? `-n ${data.namespace}` : '-A'
    const output = await kubectl(
      `get pods ${nsFlag} -o jsonpath='{range .items[*]}{.metadata.name}|{.metadata.namespace}|{.status.phase}|{.status.containerStatuses[0].restartCount}|{.metadata.creationTimestamp}|{.status.podIP}|{.spec.nodeName}|{.status.containerStatuses[*].name}|{.status.containerStatuses[*].ready}{"\\n"}{end}'`
    )

    const pods: K8sPod[] = []
    const lines = output.split('\n').filter(Boolean)

    for (const line of lines) {
      const parts = line.split('|')
      if (parts.length < 9) continue

      const createdAt = new Date(parts[4])
      const age = formatAge(createdAt)
      const containers = parts[7] ? parts[7].split(' ').filter(Boolean) : []
      const readyStatuses = parts[8] ? parts[8].split(' ').filter(Boolean) : []
      const readyCount = readyStatuses.filter((s) => s === 'true').length
      const ready = `${readyCount}/${containers.length}`

      pods.push({
        name: parts[0],
        namespace: parts[1],
        status: parts[2],
        restarts: parts[3] || '0',
        age,
        ip: parts[5] || '-',
        node: parts[6] || '-',
        containers,
        ready,
      })
    }

    return pods
  })

export const getServices = createServerFn({ method: 'POST' })
  .inputValidator((input: { namespace?: string }) => input)
  .handler(async ({ data }): Promise<K8sService[]> => {
    const nsFlag = data?.namespace ? `-n ${data.namespace}` : '-A'
    const output = await kubectl(
      `get services ${nsFlag} -o jsonpath='{range .items[*]}{.metadata.name}|{.metadata.namespace}|{.spec.type}|{.spec.clusterIP}|{.status.loadBalancer.ingress[0].ip}|{.spec.ports[*].port}:{.spec.ports[*].targetPort}|{.metadata.creationTimestamp}{"\\n"}{end}'`
    )

    const services: K8sService[] = []
    const lines = output.split('\n').filter(Boolean)

    for (const line of lines) {
      const parts = line.split('|')
      if (parts.length < 7) continue

      const createdAt = new Date(parts[6])
      const age = formatAge(createdAt)

      services.push({
        name: parts[0],
        namespace: parts[1],
        type: parts[2],
        clusterIp: parts[3] || '-',
        externalIp: parts[4] || '-',
        ports: parts[5] || '-',
        age,
      })
    }

    return services
  })

export const getNodesWithWorkloads = createServerFn({ method: 'POST' })
  .inputValidator((input: Record<string, never>) => input)
  .handler(async (): Promise<K8sNodeWithWorkloads[]> => {
    const [nodes, pods] = await Promise.all([
      getNodes({ data: {} }),
      getPods({ data: {} }),
    ])

    const podsByNode = new Map<string, K8sPod[]>()
    for (const pod of pods) {
      const nodeName = pod.node
      if (!podsByNode.has(nodeName)) {
        podsByNode.set(nodeName, [])
      }
      podsByNode.get(nodeName)!.push(pod)
    }

    return nodes.map((node) => ({
      ...node,
      pods: podsByNode.get(node.name) || [],
      podCount: (podsByNode.get(node.name) || []).length,
    }))
  })

function formatAge(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  if (Number.isNaN(diffMs) || diffMs < 0) return '-'

  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  return `${days}d`
}

function formatMemory(memory: string): string {
  if (!memory) return '-'
  const match = memory.match(/^(\d+)Ki$/)
  if (match) {
    const kb = parseInt(match[1], 10)
    const gb = (kb / 1024 / 1024).toFixed(1)
    return `${gb}Gi`
  }
  return memory
}
