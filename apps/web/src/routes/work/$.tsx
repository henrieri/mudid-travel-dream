import { createFileRoute, Link } from '@tanstack/react-router'
import {
  getPullRequest,
  getPullRequestComments,
  getPullRequestFiles,
  getPullRequestChecks,
  getWorkflowRuns,
  getUser,
  getUserRepos,
  getRepo,
  getRepoPRs,
  getRepoBranches,
  getRepoContributors,
  type GitHubPR,
  type GitHubComment,
  type GitHubFile,
  type GitHubCheckRun,
  type GitHubWorkflowRun,
  type GitHubUser,
  type GitHubRepo,
  type GitHubPRSummary,
} from '../../lib/github'
import { getDemoAssets, type DemoAssets } from '../../lib/artifacts'
import { formatAge } from '../../lib/format'
import { ImageGallery } from '../../components/ImageGallery'
import { StatsPill } from '../../components/report/StatsPill'
import { MarkdownBlock } from '../../components/Markdown'
import {
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  FileCode,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Image,
  Video,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  Activity,
  Building2,
  FolderGit2,
  Star,
  GitFork,
  Eye,
  Code2,
  Users,
  BookOpen,
} from 'lucide-react'
import { useState } from 'react'

type ParsedOrgPath = {
  kind: 'org'
  provider: 'github.com'
  owner: string
}

type ParsedRepoPath = {
  kind: 'repo'
  provider: 'github.com'
  owner: string
  repo: string
}

type ParsedPRPath = {
  kind: 'pull'
  provider: 'github.com'
  owner: string
  repo: string
  number: number
}

type ParsedPath = ParsedOrgPath | ParsedRepoPath | ParsedPRPath | null

function parsePath(path: string): ParsedPath {
  const parts = path.split('/').filter(Boolean)

  if (parts.length < 2) return null
  if (parts[0] !== 'github.com') return null

  // github.com/owner
  if (parts.length === 2) {
    return {
      kind: 'org',
      provider: 'github.com',
      owner: parts[1],
    }
  }

  // github.com/owner/repo
  if (parts.length === 3) {
    return {
      kind: 'repo',
      provider: 'github.com',
      owner: parts[1],
      repo: parts[2],
    }
  }

  // github.com/owner/repo/pull/123
  if (parts.length >= 5 && parts[3] === 'pull') {
    const number = parseInt(parts[4], 10)
    if (Number.isNaN(number)) return null

    return {
      kind: 'pull',
      provider: 'github.com',
      owner: parts[1],
      repo: parts[2],
      number,
    }
  }

  return null
}

type OrgLoaderData = {
  kind: 'org'
  parsed: ParsedOrgPath
  user: GitHubUser
  repos: GitHubRepo[]
}

type RepoLoaderData = {
  kind: 'repo'
  parsed: ParsedRepoPath
  repo: GitHubRepo
  prs: GitHubPRSummary[]
  branches: Array<{ name: string; protected: boolean }>
  contributors: Array<{ login: string; avatar_url: string; contributions: number }>
}

type PRLoaderData = {
  kind: 'pull'
  parsed: ParsedPRPath
  pr: GitHubPR
  comments: GitHubComment[]
  files: GitHubFile[]
  checks: GitHubCheckRun[]
  workflowRuns: GitHubWorkflowRun[]
  assets: DemoAssets
}

type LoaderData = OrgLoaderData | RepoLoaderData | PRLoaderData

export const Route = createFileRoute('/work/$')({
  loader: async ({ params }): Promise<LoaderData> => {
    const path = params._splat ?? ''
    const parsed = parsePath(path)

    if (!parsed) {
      throw new Error(`Invalid path: ${path}. Expected format: github.com/owner, github.com/owner/repo, or github.com/owner/repo/pull/number`)
    }

    // Org view
    if (parsed.kind === 'org') {
      const [user, repos] = await Promise.all([
        getUser({ data: { username: parsed.owner } }),
        getUserRepos({ data: { username: parsed.owner, perPage: 30 } }),
      ])
      return { kind: 'org', parsed, user, repos }
    }

    // Repo view
    if (parsed.kind === 'repo') {
      const [repo, prs, branches, contributors] = await Promise.all([
        getRepo({ data: { owner: parsed.owner, repo: parsed.repo } }),
        getRepoPRs({ data: { owner: parsed.owner, repo: parsed.repo, state: 'all', perPage: 20 } }),
        getRepoBranches({ data: { owner: parsed.owner, repo: parsed.repo } }),
        getRepoContributors({ data: { owner: parsed.owner, repo: parsed.repo } }),
      ])
      return { kind: 'repo', parsed, repo, prs, branches, contributors }
    }

    // PR view
    const { owner, repo, number } = parsed
    const [pr, comments, files, assets] = await Promise.all([
      getPullRequest({ data: { owner, repo, number } }),
      getPullRequestComments({ data: { owner, repo, number } }),
      getPullRequestFiles({ data: { owner, repo, number } }),
      getDemoAssets({ data: { repo, prNumber: number } }),
    ])

    const [checks, workflowRuns] = await Promise.all([
      getPullRequestChecks({ data: { owner, repo, sha: pr.head.sha } }),
      getWorkflowRuns({ data: { owner, repo, sha: pr.head.sha } }),
    ])

    return {
      kind: 'pull',
      parsed,
      pr,
      comments,
      files,
      checks,
      workflowRuns,
      assets,
    }
  },
  pendingComponent: PageSkeleton,
  pendingMs: 200,
  pendingMinMs: 400,
  component: WorkPage,
})

function WorkPage() {
  const data = Route.useLoaderData()

  if (data.kind === 'org') {
    return <OrgPage data={data} />
  }
  if (data.kind === 'repo') {
    return <RepoPage data={data} />
  }
  return <PrInvestigatePage data={data} />
}

function PrInvestigatePage({ data }: { data: PRLoaderData }) {
  const { parsed, pr, comments, files, checks, workflowRuns, assets } = data

  const statusColor = pr.merged
    ? 'text-violet-400'
    : pr.state === 'closed'
      ? 'text-rose-400'
      : 'text-emerald-400'

  const statusBg = pr.merged
    ? 'bg-violet-500/15 border-violet-400/30'
    : pr.state === 'closed'
      ? 'bg-rose-500/15 border-rose-400/30'
      : 'bg-emerald-500/15 border-emerald-400/30'

  const statusText = pr.merged ? 'Merged' : pr.state === 'closed' ? 'Closed' : 'Open'

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/work" className="hover:text-cyan-400 transition">
          Work
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to={`/work/github.com/${parsed.owner}`}
          className="hover:text-cyan-400 transition"
        >
          {parsed.owner}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to={`/work/github.com/${parsed.owner}/${parsed.repo}`}
          className="hover:text-cyan-400 transition"
        >
          {parsed.repo}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-300">#{parsed.number}</span>
      </nav>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusBg} ${statusColor}`}
              >
                {pr.merged ? (
                  <GitMerge className="h-3.5 w-3.5" />
                ) : (
                  <GitPullRequest className="h-3.5 w-3.5" />
                )}
                {statusText}
              </span>
              {pr.draft && (
                <span className="rounded-full border border-slate-400/30 bg-slate-500/15 px-2.5 py-0.5 text-xs text-slate-300">
                  Draft
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-white">{pr.title}</h1>
            <p className="mt-2 text-sm text-slate-400">
              <span className="font-medium text-slate-300">{pr.user.login}</span> wants to
              merge {pr.commits} commit{pr.commits !== 1 ? 's' : ''} into{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300">
                {pr.base.ref}
              </code>{' '}
              from{' '}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300">
                {pr.head.ref}
              </code>
            </p>
          </div>
          <a
            href={pr.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </a>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-2">
          <StatsPill
            label="Changed"
            value={`${pr.changed_files} file${pr.changed_files !== 1 ? 's' : ''}`}
          />
          <StatsPill
            label="Additions"
            value={`+${pr.additions}`}
            className="text-emerald-400"
          />
          <StatsPill
            label="Deletions"
            value={`-${pr.deletions}`}
            className="text-rose-400"
          />
          <StatsPill label="Comments" value={String(pr.comments + pr.review_comments)} />
          <StatsPill label="Created" value={formatAge(pr.created_at)} />
          {pr.merged_at && <StatsPill label="Merged" value={formatAge(pr.merged_at)} />}
        </div>
      </header>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Assets & Files */}
        <div className="lg:col-span-2 space-y-6">
          {/* Demo Assets */}
          <DemoAssetsSection assets={assets} />

          {/* Changed Files */}
          <FilesSection files={files} />

          {/* Description */}
          {pr.body && (
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-500/10 via-slate-950/70 to-slate-950/40 p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <FileCode className="h-4 w-4 text-slate-400" />
                Description
              </h2>
              <MarkdownBlock content={pr.body} />
            </section>
          )}
        </div>

        {/* Right column - CI Status & Comments */}
        <div className="space-y-6">
          {/* CI Status */}
          <CIStatusSection checks={checks} workflowRuns={workflowRuns} />

          {/* Labels */}
          {pr.labels.length > 0 && (
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 via-slate-950/70 to-slate-950/40 p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Labels</h2>
              <div className="flex flex-wrap gap-2">
                {pr.labels.map((label) => (
                  <span
                    key={label.name}
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `#${label.color}20`,
                      borderColor: `#${label.color}50`,
                      color: `#${label.color}`,
                      borderWidth: 1,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Comments */}
          <CommentsSection comments={comments} />

          {/* Author */}
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-950/70 to-slate-950/40 p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
              <User className="h-4 w-4 text-slate-400" />
              Author
            </h2>
            <div className="flex items-center gap-3">
              <img
                src={pr.user.avatar_url}
                alt={pr.user.login}
                className="h-10 w-10 rounded-full border border-white/10"
              />
              <div>
                <p className="text-sm font-medium text-white">{pr.user.login}</p>
                <p className="text-xs text-slate-500">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  {formatAge(pr.created_at)} ago
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function DemoAssetsSection({ assets }: { assets: DemoAssets }) {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(
    assets.videos.length > 0 ? assets.videos[0].path : null
  )
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const hasAssets =
    assets.screenshots.length > 0 ||
    assets.videos.length > 0 ||
    assets.traces.length > 0

  const openGallery = (index: number) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  if (!hasAssets) {
    return (
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950/70 to-slate-950/40 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <Activity className="h-4 w-4 text-violet-400" />
          Demo Assets
        </h2>
        <p className="text-sm text-slate-400">
          No demo recordings found for this PR. Run demo tests to generate screenshots and
          videos.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950/70 to-slate-950/40 p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
        <Activity className="h-4 w-4 text-violet-400" />
        Demo Assets
        <span className="ml-auto text-xs text-slate-500">
          {assets.screenshots.length + assets.videos.length} files
        </span>
      </h2>

      {/* Screenshots */}
      {assets.screenshots.length > 0 && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-3">
            <Image className="h-3.5 w-3.5" />
            Screenshots ({assets.screenshots.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {assets.screenshots.map((screenshot, index) => (
              <button
                key={screenshot.path}
                type="button"
                onClick={() => openGallery(index)}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-800 transition hover:border-cyan-400/40 text-left"
              >
                <div className="aspect-video flex items-center justify-center">
                  <img
                    src={screenshot.url}
                    alt={screenshot.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs text-white truncate">{screenshot.name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Image Gallery Lightbox */}
          <ImageGallery
            images={assets.screenshots}
            initialIndex={galleryIndex}
            isOpen={galleryOpen}
            onClose={() => setGalleryOpen(false)}
          />
        </div>
      )}

      {/* Videos */}
      {assets.videos.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-3">
            <Video className="h-3.5 w-3.5" />
            Videos ({assets.videos.length})
          </h3>
          <div className="space-y-3">
            {assets.videos.map((video) => (
              <div
                key={video.path}
                className="rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedVideo(expandedVideo === video.path ? null : video.path)
                  }
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/5 transition"
                >
                  <Play className="h-4 w-4 text-cyan-400" />
                  <span className="flex-1 text-sm text-slate-200 truncate">
                    {getDisplayName(video.path)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition ${
                      expandedVideo === video.path ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedVideo === video.path && (
                  <div className="px-4 pb-4">
                    <video
                      src={video.url}
                      controls
                      className="w-full rounded-lg"
                      autoPlay
                    >
                      <track kind="captions" />
                    </video>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open in new tab
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function FilesSection({ files }: { files: GitHubFile[] }) {
  const [showAll, setShowAll] = useState(false)
  const displayFiles = showAll ? files : files.slice(0, 10)

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/10 via-slate-950/70 to-slate-950/40 p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
        <FileCode className="h-4 w-4 text-sky-400" />
        Changed Files
        <span className="ml-auto text-xs text-slate-500">{files.length} files</span>
      </h2>
      <div className="space-y-2">
        {displayFiles.map((file) => (
          <div
            key={file.filename}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm"
          >
            <FileIcon status={file.status} />
            <span className="flex-1 text-slate-200 truncate font-mono text-xs">
              {file.filename}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400">+{file.additions}</span>
              <span className="text-rose-400">-{file.deletions}</span>
            </div>
          </div>
        ))}
      </div>
      {files.length > 10 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-200"
        >
          {showAll ? 'Show less' : `Show all ${files.length} files`}
        </button>
      )}
    </section>
  )
}

function FileIcon({ status }: { status: string }) {
  const className = 'h-3.5 w-3.5'
  switch (status) {
    case 'added':
      return <span className={`${className} text-emerald-400`}>+</span>
    case 'removed':
      return <span className={`${className} text-rose-400`}>-</span>
    case 'renamed':
      return <span className={`${className} text-amber-400`}>~</span>
    default:
      return <span className={`${className} text-slate-400`}>M</span>
  }
}

function CIStatusSection({
  checks,
  workflowRuns,
}: {
  checks: GitHubCheckRun[]
  workflowRuns: GitHubWorkflowRun[]
}) {
  const allPassed = checks.every((c) => c.conclusion === 'success')
  const anyFailed = checks.some((c) => c.conclusion === 'failure')
  const anyPending = checks.some((c) => c.status !== 'completed')

  const overallStatus = anyPending
    ? 'pending'
    : anyFailed
      ? 'failed'
      : allPassed
        ? 'passed'
        : 'unknown'

  const statusConfig = {
    passed: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/10',
      label: 'All checks passed',
    },
    failed: {
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'from-rose-500/10',
      label: 'Some checks failed',
    },
    pending: {
      icon: Clock,
      color: 'text-amber-400',
      bg: 'from-amber-500/10',
      label: 'Checks in progress',
    },
    unknown: {
      icon: Activity,
      color: 'text-slate-400',
      bg: 'from-slate-500/10',
      label: 'No checks',
    },
  }

  const config = statusConfig[overallStatus]
  const StatusIcon = config.icon

  return (
    <section
      className={`rounded-3xl border border-white/10 bg-gradient-to-br ${config.bg} via-slate-950/70 to-slate-950/40 p-6`}
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
        <StatusIcon className={`h-4 w-4 ${config.color}`} />
        CI Status
      </h2>
      <p className={`text-sm ${config.color} mb-4`}>{config.label}</p>

      {checks.length > 0 && (
        <div className="space-y-2">
          {checks.map((check) => (
            <a
              key={check.name}
              href={check.html_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs transition hover:border-cyan-400/30"
            >
              <CheckIcon conclusion={check.conclusion} status={check.status} />
              <span className="flex-1 text-slate-300 truncate">{check.name}</span>
              {check.completed_at && (
                <span className="text-slate-500">{formatAge(check.completed_at)}</span>
              )}
            </a>
          ))}
        </div>
      )}

      {checks.length === 0 && (
        <p className="text-sm text-slate-500">No CI checks found for this PR.</p>
      )}
    </section>
  )
}

function CheckIcon({
  conclusion,
  status,
}: {
  conclusion: string | null
  status: string
}) {
  if (status !== 'completed') {
    return <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
  }
  if (conclusion === 'success') {
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
  }
  if (conclusion === 'failure') {
    return <XCircle className="h-3.5 w-3.5 text-rose-400" />
  }
  return <Activity className="h-3.5 w-3.5 text-slate-400" />
}

function CommentsSection({ comments }: { comments: GitHubComment[] }) {
  if (comments.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-500/10 via-slate-950/70 to-slate-950/40 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <MessageSquare className="h-4 w-4 text-slate-400" />
          Comments
        </h2>
        <p className="text-sm text-slate-500">No comments yet.</p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-500/10 via-slate-950/70 to-slate-950/40 p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
        <MessageSquare className="h-4 w-4 text-slate-400" />
        Comments
        <span className="ml-auto text-xs text-slate-500">{comments.length}</span>
      </h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-xl border border-white/5 bg-white/5 p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <img
                src={comment.user.avatar_url}
                alt={comment.user.login}
                className="h-5 w-5 rounded-full"
              />
              <span className="text-xs font-medium text-slate-300">
                {comment.user.login}
              </span>
              <span className="text-xs text-slate-500">
                {formatAge(comment.created_at)}
              </span>
            </div>
            <div className="text-xs text-slate-400 line-clamp-6">
              <MarkdownBlock content={comment.body} />
            </div>
            <a
              href={comment.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-400 hover:text-cyan-300"
            >
              <ExternalLink className="h-3 w-3" />
              View
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============= ORG PAGE =============
function OrgPage({ data }: { data: OrgLoaderData }) {
  const { parsed, user, repos } = data
  const isOrg = user.type === 'Organization'

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/work" className="hover:text-cyan-400 transition">
          Work
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-300">{parsed.owner}</span>
      </nav>

      {/* Header */}
      <header className="flex items-start gap-6">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="h-20 w-20 rounded-2xl border border-white/10"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-white">
              {user.name ?? user.login}
            </h1>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
              {isOrg ? 'Organization' : 'User'}
            </span>
          </div>
          {user.bio && (
            <p className="text-sm text-slate-400 mb-3">{user.bio}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <StatsPill label="Repos" value={String(user.public_repos)} />
            <StatsPill label="Followers" value={String(user.followers)} />
            <StatsPill label="Following" value={String(user.following)} />
            <StatsPill label="Joined" value={formatAge(user.created_at)} />
          </div>
        </div>
        <a
          href={user.html_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
        >
          <ExternalLink className="h-4 w-4" />
          View on GitHub
        </a>
      </header>

      {/* Repositories */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-950/70 to-slate-950/40 p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <FolderGit2 className="h-4 w-4 text-cyan-400" />
          Repositories
          <span className="ml-auto text-xs text-slate-500">{repos.length} shown</span>
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {repos.map((repo) => (
            <Link
              key={repo.name}
              to={`/work/github.com/${parsed.owner}/${repo.name}`}
              className="group rounded-xl border border-white/5 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-white group-hover:text-cyan-200 transition">
                  {repo.name}
                </h3>
                {repo.private && (
                  <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
                    Private
                  </span>
                )}
              </div>
              {repo.description && (
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                  {repo.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <Code2 className="h-3 w-3" />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="h-3 w-3" />
                  {repo.forks_count}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatAge(repo.pushed_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

// ============= REPO PAGE =============
function RepoPage({ data }: { data: RepoLoaderData }) {
  const { parsed, repo, prs, branches, contributors } = data
  const [prFilter, setPrFilter] = useState<'all' | 'open' | 'closed'>('all')

  const filteredPRs = prs.filter((pr) => {
    if (prFilter === 'all') return true
    if (prFilter === 'open') return pr.state === 'open'
    return pr.state === 'closed'
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/work" className="hover:text-cyan-400 transition">
          Work
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to={`/work/github.com/${parsed.owner}`}
          className="hover:text-cyan-400 transition"
        >
          {parsed.owner}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-300">{parsed.repo}</span>
      </nav>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FolderGit2 className="h-6 w-6 text-cyan-400" />
              <h1 className="text-2xl font-semibold text-white">{repo.name}</h1>
              {repo.private && (
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300">
                  Private
                </span>
              )}
            </div>
            {repo.description && (
              <p className="text-sm text-slate-400">{repo.description}</p>
            )}
          </div>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </a>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-2">
          {repo.language && <StatsPill label="Language" value={repo.language} />}
          <StatsPill label="Stars" value={String(repo.stargazers_count)} />
          <StatsPill label="Forks" value={String(repo.forks_count)} />
          <StatsPill label="Open Issues" value={String(repo.open_issues_count)} />
          <StatsPill label="Branches" value={String(branches.length)} />
          <StatsPill label="Default" value={repo.default_branch} />
        </div>
      </header>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - PRs */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950/70 to-slate-950/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <GitPullRequest className="h-4 w-4 text-violet-400" />
                Pull Requests
                <span className="ml-2 text-xs text-slate-500">{prs.length} total</span>
              </h2>
              <div className="flex gap-1">
                {(['all', 'open', 'closed'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setPrFilter(filter)}
                    className={`rounded-lg px-2.5 py-1 text-xs transition ${
                      prFilter === filter
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filteredPRs.length === 0 ? (
              <p className="text-sm text-slate-500">No pull requests found.</p>
            ) : (
              <div className="space-y-2">
                {filteredPRs.map((pr) => {
                  const isMerged = pr.merged_at !== null
                  const statusColor = isMerged
                    ? 'text-violet-400'
                    : pr.state === 'closed'
                      ? 'text-rose-400'
                      : 'text-emerald-400'

                  return (
                    <Link
                      key={pr.number}
                      to={`/work/github.com/${parsed.owner}/${parsed.repo}/pull/${pr.number}`}
                      className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-cyan-400/30 hover:bg-white/10"
                    >
                      <span className={statusColor}>
                        {isMerged ? (
                          <GitMerge className="h-4 w-4" />
                        ) : (
                          <GitPullRequest className="h-4 w-4" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white group-hover:text-cyan-200 truncate">
                            {pr.title}
                          </span>
                          {pr.draft && (
                            <span className="rounded-full border border-slate-400/30 bg-slate-500/15 px-2 py-0.5 text-[10px] text-slate-400">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          #{pr.number} by {pr.user.login} · {formatAge(pr.updated_at)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right column - Info */}
        <div className="space-y-6">
          {/* Branches */}
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/10 via-slate-950/70 to-slate-950/40 p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
              <GitBranch className="h-4 w-4 text-sky-400" />
              Branches
              <span className="ml-auto text-xs text-slate-500">{branches.length}</span>
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {branches.slice(0, 15).map((branch) => (
                <div
                  key={branch.name}
                  className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs"
                >
                  <GitBranch className="h-3 w-3 text-slate-500" />
                  <span className="flex-1 text-slate-300 truncate font-mono">
                    {branch.name}
                  </span>
                  {branch.protected && (
                    <span className="text-amber-400 text-[10px]">protected</span>
                  )}
                  {branch.name === repo.default_branch && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">
                      default
                    </span>
                  )}
                </div>
              ))}
              {branches.length > 15 && (
                <p className="text-xs text-slate-500 text-center py-2">
                  +{branches.length - 15} more branches
                </p>
              )}
            </div>
          </section>

          {/* Contributors */}
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 via-slate-950/70 to-slate-950/40 p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
              <Users className="h-4 w-4 text-amber-400" />
              Top Contributors
            </h2>
            <div className="space-y-2">
              {contributors.map((contributor) => (
                <Link
                  key={contributor.login}
                  to={`/work/github.com/${contributor.login}`}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2 transition hover:border-cyan-400/30"
                >
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="flex-1 text-sm text-slate-300">
                    {contributor.login}
                  </span>
                  <span className="text-xs text-slate-500">
                    {contributor.contributions} commits
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Activity */}
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-500/10 via-slate-950/70 to-slate-950/40 p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
              <Activity className="h-4 w-4 text-slate-400" />
              Activity
            </h2>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-slate-300">{formatAge(repo.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last updated</span>
                <span className="text-slate-300">{formatAge(repo.updated_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last push</span>
                <span className="text-slate-300">{formatAge(repo.pushed_at)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// ============= SKELETON =============
function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-3 w-48 rounded-full bg-white/10" />
      <header className="space-y-4">
        <div className="h-6 w-24 rounded-full bg-white/10" />
        <div className="h-8 w-96 rounded-full bg-white/10" />
        <div className="h-4 w-72 rounded-full bg-white/10" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-white/10" />
          ))}
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 rounded-3xl bg-white/5" />
          <div className="h-48 rounded-3xl bg-white/5" />
        </div>
        <div className="space-y-6">
          <div className="h-48 rounded-3xl bg-white/5" />
          <div className="h-32 rounded-3xl bg-white/5" />
        </div>
      </div>
    </div>
  )
}

/**
 * Get a display name from a file path that includes parent directory
 * e.g., "repo/pr-5/login-flow/video.webm" -> "login-flow/video.webm"
 */
function getDisplayName(path: string): string {
  const parts = path.split('/')
  if (parts.length >= 2) {
    return parts.slice(-2).join('/')
  }
  return parts[parts.length - 1] ?? path
}
