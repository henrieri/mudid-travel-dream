import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { formatAge } from '../../lib/format'
import { useState } from 'react'
import {
  Search,
  GitPullRequest,
  ExternalLink,
  ArrowRight,
} from 'lucide-react'

type RecentPR = {
  id: string
  title: string
  repo: string
  url: string
  createdAt: string
  state: 'open' | 'closed'
}

type GitHubPR = {
  number: number
  title: string
  html_url: string
  created_at: string
  state: string
}

const X_API_URL = process.env.X_API_URL ?? 'http://x.mudid'
const X_API_HOST = process.env.X_API_HOST ?? 'x.mudid'

// Repos to fetch PRs from
const TRACKED_REPOS = [
  'henrieri/mudid-k8s-observatory',
  'henrieri/tanstack-observatory',
  'henrieri/mudid-best-practice',
  'henrieri/mudid-simple-hello-world-ci-test',
  'henrieri/mudid-infra',
]

const fetchLivePRs = createServerFn({ method: 'POST' }).handler(async () => {
  const allPrs: RecentPR[] = []

  for (const repo of TRACKED_REPOS) {
    try {
      const response = await fetch(X_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Host: X_API_HOST,
        },
        body: JSON.stringify({
          operationName: 'github.request',
          input: {
            method: 'GET',
            path: `/repos/${repo}/pulls?state=all&per_page=10&sort=created&direction=desc`,
          },
        }),
      })

      if (!response.ok) continue

      const payload = await response.json() as {
        success?: boolean
        data?: { body?: GitHubPR[] }
      }

      if (payload?.success && payload?.data?.body) {
        for (const pr of payload.data.body) {
          allPrs.push({
            id: String(pr.number),
            title: pr.title,
            repo,
            url: pr.html_url,
            createdAt: pr.created_at,
            state: pr.state === 'open' ? 'open' : 'closed',
          })
        }
      }
    } catch {
      // Skip repos that fail
    }
  }

  // Sort by most recent and take top 20
  return allPrs
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 20)
})

export const Route = createFileRoute('/work/')({
  loader: async () => {
    const recentPrs = await fetchLivePRs()
    return { recentPrs }
  },
  pendingComponent: WorkIndexSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: WorkIndexPage,
})

function WorkIndexPage() {
  const { recentPrs } = Route.useLoaderData()
  const navigate = useNavigate()
  const [inputUrl, setInputUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Parse GitHub URL
    // Supports: https://github.com/owner/repo/pull/123
    // Or: github.com/owner/repo/pull/123
    // Or: owner/repo/pull/123
    // Or: owner/repo#123
    let url = inputUrl.trim()

    // Remove https://
    url = url.replace(/^https?:\/\//, '')

    // Handle shorthand: owner/repo#123
    const shorthandMatch = url.match(/^([^/]+)\/([^/#]+)#(\d+)$/)
    if (shorthandMatch) {
      navigate({
        to: '/work/$',
        params: { _splat: `github.com/${shorthandMatch[1]}/${shorthandMatch[2]}/pull/${shorthandMatch[3]}` },
      })
      return
    }

    // Handle full path
    const fullMatch = url.match(
      /^(?:github\.com\/)?([^/]+)\/([^/]+)\/pull\/(\d+)/
    )
    if (fullMatch) {
      navigate({
        to: '/work/$',
        params: { _splat: `github.com/${fullMatch[1]}/${fullMatch[2]}/pull/${fullMatch[3]}` },
      })
      return
    }

    setError(
      'Invalid PR URL. Use format: owner/repo#123 or github.com/owner/repo/pull/123'
    )
  }

  const handlePrClick = (pr: RecentPR) => {
    // Parse the GitHub URL to extract owner/repo/number
    const match = pr.url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
    if (match) {
      navigate({
        to: '/work/$',
        params: { _splat: `github.com/${match[1]}/${match[2]}/pull/${match[3]}` },
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Search form */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-950/70 to-slate-950/40 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Search className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Investigate a Pull Request
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            Enter a GitHub PR URL to see details, CI status, demo assets, and more.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value)
                    setError(null)
                  }}
                  placeholder="owner/repo#123 or github.com/owner/repo/pull/123"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/30 hover:scale-105"
              >
                Investigate
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {error && (
              <p className="text-sm text-rose-400">{error}</p>
            )}
          </form>
        </div>
      </section>

      {/* Recent PRs */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950/70 to-slate-950/40 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <GitPullRequest className="h-4 w-4 text-violet-400" />
          Recent Pull Requests
          <span className="ml-auto text-xs text-slate-500">
            Click to investigate
          </span>
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          {recentPrs.map((pr) => (
            <button
              key={`${pr.repo}-${pr.id}`}
              type="button"
              onClick={() => handlePrClick(pr)}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-cyan-400/40 hover:bg-white/10 group"
            >
              <GitPullRequest
                className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  pr.state === 'open' ? 'text-emerald-400' : 'text-violet-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate group-hover:text-cyan-200 transition">
                  {pr.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{pr.repo}</span>
                  <span>#{pr.id}</span>
                  <span>{formatAge(pr.createdAt)}</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition" />
            </button>
          ))}
        </div>

        {recentPrs.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            No recent PRs found in snapshot data.
          </p>
        )}
      </section>

      {/* Quick links section */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-500/10 via-slate-950/70 to-slate-950/40 p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Quick Examples</h2>
        <div className="flex flex-wrap gap-2">
          {[
            'henrieri/mudid-simple-hello-world-ci-test#4',
            'henrieri/mudid-best-practice#1',
          ].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setInputUrl(example)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-200"
            >
              {example}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function WorkIndexSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-white/10 mb-4" />
          <div className="h-6 w-64 mx-auto rounded-full bg-white/10 mb-2" />
          <div className="h-4 w-96 mx-auto rounded-full bg-white/10 mb-6" />
          <div className="h-12 rounded-xl bg-white/10" />
        </div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="h-4 w-40 rounded-full bg-white/10 mb-4" />
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/10" />
          ))}
        </div>
      </section>
    </div>
  )
}
