import { createServerFn } from '@tanstack/react-start'

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? 'http://minio.minio.svc.cluster.local:9000'
const ARTIFACTS_PUBLIC_URL = process.env.ARTIFACTS_PUBLIC_URL ?? 'http://artifacts.mudid'

type ArtifactFile = {
  name: string
  path: string
  size: number
  lastModified: string
  url: string
  type: 'screenshot' | 'video' | 'trace' | 'other'
}

type DemoAssets = {
  screenshots: ArtifactFile[]
  videos: ArtifactFile[]
  traces: ArtifactFile[]
  other: ArtifactFile[]
  basePath: string
  publicUrl: string
}

function getFileType(filename: string): ArtifactFile['type'] {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return 'screenshot'
  }
  if (lower.endsWith('.webm') || lower.endsWith('.mp4')) {
    return 'video'
  }
  if (lower.endsWith('.zip') && lower.includes('trace')) {
    return 'trace'
  }
  return 'other'
}

// Parse MinIO XML listing response
function parseMinioListing(xml: string, basePath: string): ArtifactFile[] {
  const files: ArtifactFile[] = []

  // Match Contents elements
  const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g
  let match: RegExpExecArray | null

  while ((match = contentsRegex.exec(xml)) !== null) {
    const content = match[1]

    const keyMatch = /<Key>(.*?)<\/Key>/.exec(content)
    const sizeMatch = /<Size>(.*?)<\/Size>/.exec(content)
    const lastModifiedMatch = /<LastModified>(.*?)<\/LastModified>/.exec(content)

    if (keyMatch) {
      const key = keyMatch[1]
      const name = key.split('/').pop() ?? key
      const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 0
      const lastModified = lastModifiedMatch?.[1] ?? ''

      // Skip directory markers
      if (size === 0 && key.endsWith('/')) continue

      const url = `${ARTIFACTS_PUBLIC_URL}/demos/${key}`

      files.push({
        name,
        path: key,
        size,
        lastModified,
        url,
        type: getFileType(name),
      })
    }
  }

  return files
}

export const getDemoAssets = createServerFn({ method: 'POST' })
  .inputValidator((input: { repo: string; prNumber: number }) => input)
  .handler(async ({ data }): Promise<DemoAssets> => {
    const basePath = `demos/${data.repo}/pr-${data.prNumber}`
    const publicUrl = `${ARTIFACTS_PUBLIC_URL}/${basePath}`

    try {
      // List all objects with the prefix
      const response = await fetch(
        `${MINIO_ENDPOINT}/demos?list-type=2&prefix=${data.repo}/pr-${data.prNumber}/`,
        {
          headers: {
            'User-Agent': 'TanStack-Observatory',
          },
        }
      )

      if (!response.ok) {
        // Return empty if bucket/path doesn't exist
        if (response.status === 404) {
          return {
            screenshots: [],
            videos: [],
            traces: [],
            other: [],
            basePath,
            publicUrl,
          }
        }
        throw new Error(`MinIO error ${response.status}`)
      }

      const xml = await response.text()
      const files = parseMinioListing(xml, basePath)

      return {
        screenshots: files.filter((f) => f.type === 'screenshot'),
        videos: files.filter((f) => f.type === 'video'),
        traces: files.filter((f) => f.type === 'trace'),
        other: files.filter((f) => f.type === 'other'),
        basePath,
        publicUrl,
      }
    } catch (error) {
      console.error('Failed to fetch demo assets:', error)
      return {
        screenshots: [],
        videos: [],
        traces: [],
        other: [],
        basePath,
        publicUrl,
      }
    }
  })

export type { ArtifactFile, DemoAssets }
