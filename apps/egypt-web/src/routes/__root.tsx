import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouter,
} from '@tanstack/react-router'

import EgyptLayout from '../components/layout/EgyptLayout'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Egypt 2026 | Sharm el Sheikh',
      },
    ],
    links: [
      {
        rel: 'icon',
        href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏛️</text></svg>',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: EgyptLayout,
  errorComponent: RootError,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-500/50">
          Error
        </p>
        <h1 className="text-2xl font-semibold text-white">
          Something went wrong
        </h1>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-slate-400">
          {error?.message ?? 'Unknown error'}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              reset()
              router.invalidate()
            }}
            className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-xs text-amber-100 transition hover:border-amber-400 hover:text-white"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:border-amber-400/40 hover:text-amber-200"
          >
            Full reload
          </button>
        </div>
      </div>
    </div>
  )
}
