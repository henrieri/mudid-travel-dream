import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import AppShell from '../components/layout/AppShell'

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
        title: 'Travel Dream | Mudid',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: AppShell,
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
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
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
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Snapshot error
        </p>
        <h1 className="text-2xl font-semibold text-white">
          We could not load snapshot data.
        </h1>
        <p className="text-sm text-slate-400">
          Ensure the snapshot generator is running and x.mudid is reachable on
          the network. Then retry to reload all view data.
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
          {error?.message ?? 'Unknown error'}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              reset()
              router.invalidate()
            }}
            className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-100 transition hover:border-cyan-400 hover:text-white"
          >
            Retry loading snapshots
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            Full reload
          </button>
        </div>
      </div>
    </div>
  )
}
