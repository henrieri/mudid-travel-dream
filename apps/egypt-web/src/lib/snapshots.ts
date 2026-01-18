import { createServerFn } from '@tanstack/react-start'

type SnapshotItem = {
  name?: string
  path?: string
  size?: number
  sha?: string
  url?: string
}

type SnapshotList = {
  items?: SnapshotItem[]
}

type SnapshotGet = {
  path?: string
  content?: string
  json?: unknown
}

const X_API_URL = process.env.X_API_URL ?? 'http://x.local'
const X_API_HOST = process.env.X_API_HOST ?? 'x.local'

async function callX<T>(operationName: string, input: unknown): Promise<T> {
  const response = await fetch(X_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Host: X_API_HOST,
    },
    body: JSON.stringify({ operationName, input }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`x.local error ${response.status}: ${body}`)
  }

  const payload = (await response.json()) as {
    success?: boolean
    data?: T
    error?: string
  }

  if (payload?.success === false) {
    throw new Error(payload.error ?? 'x.local error')
  }

  return (payload?.data ?? payload) as T
}

export const listSnapshots = createServerFn({ method: 'POST' })
  .inputValidator((input: { path?: string }) => input)
  .handler(async ({ data }) =>
    callX<SnapshotList>('snapshots.list', data?.path ? { path: data.path } : {}),
  )

export const getSnapshot = createServerFn({ method: 'POST' })
  .inputValidator((input: { path: string }) => input)
  .handler(async ({ data }) => {
    const result = await callX<SnapshotGet>('snapshots.get', {
      path: data.path,
      format: 'raw',
    })
    return result.content ?? ''
  })
