import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Home,
  Trophy,
  Calculator,
  Plane,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  Lightbulb,
  Compass,
  Users,
  HeartHandshake,
  MoreHorizontal,
} from 'lucide-react'

// Egyptian-themed icons using Unicode/emoji
const PyramidIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M12 2L2 22h20L12 2z" />
    <path d="M12 2v20" strokeDasharray="2 2" opacity="0.5" />
  </svg>
)

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: Home, exact: true },
  { to: '/evelina', label: "Evelina's Picks", icon: HeartHandshake },
  { to: '/rankings', label: 'Rankings', icon: Trophy },
  { to: '/tips', label: 'Travel Tips', icon: Lightbulb },
  { to: '/activities', label: 'Activities', icon: Compass },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/budget', label: 'Budget', icon: Calculator },
  { to: '/findings', label: 'Misc', icon: MoreHorizontal },
]

function NavLink({
  to,
  label,
  exact,
  icon: Icon,
  collapsed,
}: {
  to: string
  label: string
  exact?: boolean
  icon: typeof Home
  collapsed: boolean
}) {
  const { pathname } = useRouterState({ select: (s) => ({ pathname: s.location.pathname }) })
  const isActive = exact ? pathname === to : pathname.startsWith(to)

  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border ${
        isActive
          ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/10 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.15)] border-amber-500/30'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-transparent'
      }`}
    >
      <Icon
        className={`h-5 w-5 flex-shrink-0 ${
          isActive
            ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
            : 'text-slate-500 group-hover:text-amber-400/70'
        }`}
      />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {isActive && !collapsed && (
        <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
      )}
    </Link>
  )
}

export default function EgyptLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useRouterState({ select: (s) => ({ pathname: s.location.pathname }) })

  const pageTitle = (() => {
    if (pathname === '/') return 'Dashboard'
    if (pathname.startsWith('/evelina')) return "Evelina's Research"
    if (pathname.startsWith('/rankings')) return 'Property Rankings'
    if (pathname.startsWith('/findings')) return 'Misc'
    if (pathname.startsWith('/tips')) return 'Travel Tips'
    if (pathname.startsWith('/activities')) return 'Activities & Tours'
    if (pathname.startsWith('/community')) return 'Community Insights'
    if (pathname.startsWith('/budget')) return 'Budget Calculator'
    if (pathname.startsWith('/property')) return 'Property Details'
    return 'Egypt Trip'
  })()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M30%200L60%2030L30%2060L0%2030z%22%20fill%3D%22none%22%20stroke%3D%22%23fbbf24%22%20stroke-width%3D%220.5%22%20opacity%3D%220.03%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-amber-500/10 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-amber-500/10 px-4 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/30">
            <PyramidIcon />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                Egypt 2026
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-amber-500/50">
                Sharm el Sheikh
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {!collapsed && (
            <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-500/40">
              Trip Planning
            </p>
          )}
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Trip info */}
        {!collapsed && (
          <div className="border-t border-amber-500/10 p-4 space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent px-3 py-2">
              <Plane className="h-4 w-4 text-amber-400" />
              <div className="text-xs">
                <p className="font-medium text-amber-200">Feb 15-22, 2026</p>
                <p className="text-amber-500/60">7 nights</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Star className="h-3.5 w-3.5 text-amber-500/50" />
              Henri & Evelina
            </div>
          </div>
        )}

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-amber-500/20 bg-slate-900 text-amber-400 hover:bg-slate-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? 'pl-16' : 'pl-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-amber-500/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-amber-500/50">
                Sharm el Sheikh
              </p>
              <h2 className="text-xl font-semibold text-white">{pageTitle}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                101 Properties
              </div>
              <Link
                to="/settings"
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white hover:border-amber-500/30 transition-colors"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
