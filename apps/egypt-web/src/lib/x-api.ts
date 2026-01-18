import { createServerFn } from '@tanstack/react-start'

const X_API_URL = process.env.X_API_URL ?? 'http://x.local'
const X_API_HOST = process.env.X_API_HOST ?? 'x.local'

export type OperationInfo = {
  name: string
  description: string
  inputSchema: string
  outputSchema: string
}

export type OperationListItem = {
  name: string
  description: string
}

export type OperationsByNamespace = {
  [namespace: string]: OperationListItem[]
}

type XApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

async function callX<T>(
  operationName: string,
  input: unknown,
): Promise<XApiResponse<T>> {
  const response = await fetch(X_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Host: X_API_HOST,
    },
    body: JSON.stringify({ operationName, input }),
  })

  const payload = (await response.json()) as XApiResponse<T>
  return payload
}

export const listOperations = createServerFn({ method: 'POST' })
  .inputValidator((input: { namespace?: string }) => input)
  .handler(async ({ data }) => {
    const response = await fetch(X_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Host: X_API_HOST,
      },
      body: JSON.stringify({
        operationName: 'list',
        input: data?.namespace ? { namespace: data.namespace } : {},
      }),
    })

    if (!response.ok) {
      throw new Error(`x.local error ${response.status}`)
    }

    const payload = (await response.json()) as { operations: OperationListItem[] }

    // Group operations by namespace
    const grouped: OperationsByNamespace = {}
    for (const op of payload.operations || []) {
      const [namespace] = op.name.split('.')
      if (!grouped[namespace]) {
        grouped[namespace] = []
      }
      grouped[namespace].push(op)
    }

    return grouped
  })

export const getOperationInfo = createServerFn({ method: 'POST' })
  .inputValidator((input: { operation: string }) => input)
  .handler(async ({ data }) => {
    const response = await fetch(X_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Host: X_API_HOST,
      },
      body: JSON.stringify({
        operationName: 'info',
        input: { operation: data.operation },
      }),
    })

    if (!response.ok) {
      throw new Error(`x.local error ${response.status}`)
    }

    const payload = (await response.json()) as OperationInfo
    return payload
  })

export const executeOperation = createServerFn({ method: 'POST' })
  .inputValidator((input: { operation: string; input: unknown }) => input)
  .handler(async ({ data }): Promise<XApiResponse<unknown>> => {
    return callX(data.operation, data.input)
  })
