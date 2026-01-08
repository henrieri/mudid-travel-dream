import { createServerFn } from '@tanstack/react-start'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''

type GitHubPR = {
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  merged: boolean
  draft: boolean
  user: {
    login: string
    avatar_url: string
  }
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
  }
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  additions: number
  deletions: number
  changed_files: number
  comments: number
  review_comments: number
  commits: number
  html_url: string
  mergeable_state?: string
  labels: Array<{ name: string; color: string }>
}

type GitHubComment = {
  id: number
  user: {
    login: string
    avatar_url: string
  }
  body: string
  created_at: string
  html_url: string
}

type GitHubFile = {
  filename: string
  status: string
  additions: number
  deletions: number
  changes: number
  patch?: string
}

type GitHubCheckRun = {
  name: string
  status: 'queued' | 'in_progress' | 'completed'
  conclusion: string | null
  started_at: string | null
  completed_at: string | null
  html_url: string
}

type GitHubWorkflowRun = {
  id: number
  name: string
  status: string
  conclusion: string | null
  html_url: string
  created_at: string
  updated_at: string
  head_sha: string
}

async function githubFetch<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'TanStack-Observatory',
  }
  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`
  }

  const response = await fetch(`https://api.github.com${path}`, { headers })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`GitHub API error ${response.status}: ${body}`)
  }

  return response.json() as Promise<T>
}

export const getPullRequest = createServerFn({ method: 'POST' })
  .inputValidator((input: { owner: string; repo: string; number: number }) => input)
  .handler(async ({ data }) => {
    const pr = await githubFetch<GitHubPR>(
      `/repos/${data.owner}/${data.repo}/pulls/${data.number}`
    )
    return pr
  })

export const getPullRequestComments = createServerFn({ method: 'POST' })
  .inputValidator((input: { owner: string; repo: string; number: number }) => input)
  .handler(async ({ data }) => {
    const comments = await githubFetch<GitHubComment[]>(
      `/repos/${data.owner}/${data.repo}/issues/${data.number}/comments`
    )
    return comments
  })

export const getPullRequestFiles = createServerFn({ method: 'POST' })
  .inputValidator((input: { owner: string; repo: string; number: number }) => input)
  .handler(async ({ data }) => {
    const files = await githubFetch<GitHubFile[]>(
      `/repos/${data.owner}/${data.repo}/pulls/${data.number}/files`
    )
    return files
  })

export const getPullRequestChecks = createServerFn({ method: 'POST' })
  .inputValidator((input: { owner: string; repo: string; sha: string }) => input)
  .handler(async ({ data }) => {
    const result = await githubFetch<{ check_runs: GitHubCheckRun[] }>(
      `/repos/${data.owner}/${data.repo}/commits/${data.sha}/check-runs`
    )
    return result.check_runs
  })

export const getWorkflowRuns = createServerFn({ method: 'POST' })
  .inputValidator((input: { owner: string; repo: string; sha: string }) => input)
  .handler(async ({ data }) => {
    const result = await githubFetch<{ workflow_runs: GitHubWorkflowRun[] }>(
      `/repos/${data.owner}/${data.repo}/actions/runs?head_sha=${data.sha}`
    )
    return result.workflow_runs
  })

// Types for org/user and repo views
type GitHubUser = {
  login: string
  avatar_url: string
  name: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  html_url: string
  type: 'User' | 'Organization'
  created_at: string
}

type GitHubRepo = {
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  default_branch: string
  created_at: string
  updated_at: string
  pushed_at: string
}

type GitHubPRSummary = {
  number: number
  title: string
  state: 'open' | 'closed'
  merged_at: string | null
  draft: boolean
  user: {
    login: string
    avatar_url: string
  }
  created_at: string
  updated_at: string
  html_url: string
}

// Get user or organization details
export const getUser = createServerFn({ method: 'POST' })
  .inputValidator((input: { username: string }) => input)
  .handler(async ({ data }) => {
    return githubFetch<GitHubUser>(`/users/${data.username}`)
  })

// Get user/org repositories
export const getUserRepos = createServerFn({ method: 'POST' })
  .inputValidator((input: { username: string; perPage?: number }) => input)
  .handler(async ({ data }) => {
    const perPage = data.perPage ?? 30
    return githubFetch<GitHubRepo[]>(
      `/users/${data.username}/repos?sort=pushed&per_page=${perPage}`
    )
  })

// Get repository details
export const getRepo = createServerFn({ method: 'POST' })
  .inputValidator((input: { owner: string; repo: string }) => input)
  .handler(async ({ data }) => {
    return githubFetch<GitHubRepo>(`/repos/${data.owner}/${data.repo}`)
  })

// Get repository PRs
export const getRepoPRs = createServerFn({ method: 'POST' })
  .inputValidator((input: { owner: string; repo: string; state?: string; perPage?: number }) => input)
  .handler(async ({ data }) => {
    const state = data.state ?? 'all'
    const perPage = data.perPage ?? 30
    return githubFetch<GitHubPRSummary[]>(
      `/repos/${data.owner}/${data.repo}/pulls?state=${state}&per_page=${perPage}&sort=updated`
    )
  })

// Get repository branches
export const getRepoBranches = createServerFn({ method: 'POST' })
  .inputValidator((input: { owner: string; repo: string }) => input)
  .handler(async ({ data }) => {
    return githubFetch<Array<{ name: string; protected: boolean }>>(
      `/repos/${data.owner}/${data.repo}/branches?per_page=100`
    )
  })

// Get repository contributors
export const getRepoContributors = createServerFn({ method: 'POST' })
  .inputValidator((input: { owner: string; repo: string }) => input)
  .handler(async ({ data }) => {
    return githubFetch<Array<{ login: string; avatar_url: string; contributions: number }>>(
      `/repos/${data.owner}/${data.repo}/contributors?per_page=10`
    )
  })

export type { GitHubPR, GitHubComment, GitHubFile, GitHubCheckRun, GitHubWorkflowRun, GitHubUser, GitHubRepo, GitHubPRSummary }
