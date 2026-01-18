import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Search,
  Bug,
  Volume2,
  Droplet,
  Wrench,
  Sparkles,
  Quote,
  Calendar,
  Eye,
  Flame,
  AlertCircle,
} from 'lucide-react'

export interface VettingData {
  vetting_date: string
  verdict: 'clear' | 'concerns' | 'red_flags'
  red_flags: string[]
  safety_smoke: boolean | null
  safety_co: boolean | null
  review_sample: string | null
  notes: string | null
}

interface VettingReportProps {
  vetting?: VettingData
}

const CHECKED_PATTERNS = [
  { label: 'Noise complaints', icon: Volume2, pattern: 'noisy, noise, loud' },
  { label: 'Cleanliness issues', icon: Droplet, pattern: 'dirty, unclean, filthy' },
  { label: 'Pest reports', icon: Bug, pattern: 'cockroach, bed bugs, ants, mosquitoes' },
  { label: 'Mold/mould', icon: Droplet, pattern: 'mold, mould' },
  { label: 'Maintenance problems', icon: Wrench, pattern: 'broken' },
  { label: 'Scam reports', icon: AlertTriangle, pattern: 'scam, theft, stolen' },
  { label: 'Bad odors', icon: Droplet, pattern: 'smelly, bad smell, odor' },
  { label: 'Service issues', icon: AlertCircle, pattern: 'rude' },
]

export default function VettingReport({ vetting }: VettingReportProps) {
  if (!vetting) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
        <div className="flex items-center gap-3 text-slate-500">
          <Search className="h-5 w-5" />
          <p className="text-sm">Vetting report not yet available for this property</p>
        </div>
      </div>
    )
  }

  const verdictConfig = {
    clear: {
      bg: 'from-emerald-500/20 to-emerald-500/5',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: CheckCircle,
      label: 'Clear',
      description: 'No red flags found in reviews',
    },
    concerns: {
      bg: 'from-amber-500/20 to-amber-500/5',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      icon: AlertTriangle,
      label: 'Minor Concerns',
      description: 'Some issues noted but manageable',
    },
    red_flags: {
      bg: 'from-rose-500/20 to-rose-500/5',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      icon: AlertTriangle,
      label: 'Red Flags',
      description: 'Significant concerns found',
    },
  }

  const config = verdictConfig[vetting.verdict]
  const VerdictIcon = config.icon

  return (
    <div className="space-y-4">
      {/* Header with verdict */}
      <div className={`rounded-2xl border ${config.border} bg-gradient-to-br ${config.bg} p-6`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-slate-400" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Review Vetting</p>
            </div>
            <div className="flex items-center gap-3">
              <VerdictIcon className={`h-6 w-6 ${config.text}`} />
              <span className={`text-xl font-bold ${config.text}`}>{config.label}</span>
            </div>
            <p className="text-sm text-slate-400">{config.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              {new Date(vetting.vetting_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Red flags if any */}
      {vetting.red_flags.length > 0 && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Issues Found</p>
          <div className="flex flex-wrap gap-2">
            {vetting.red_flags.map((flag) => (
              <span
                key={flag}
                className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-medium text-rose-300"
              >
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* What was checked */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-amber-400" />
          <h4 className="font-semibold text-white text-sm">What We Checked</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CHECKED_PATTERNS.map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
              <Icon className="h-3.5 w-3.5 text-slate-500" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Safety features */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          <h4 className="font-semibold text-white text-sm">Safety Features</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Flame className={`h-4 w-4 ${vetting.safety_smoke ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className={`text-sm ${vetting.safety_smoke ? 'text-emerald-300' : 'text-slate-400'}`}>
              {vetting.safety_smoke === null ? 'Smoke alarm: N/A' : vetting.safety_smoke ? 'Smoke alarm' : 'No smoke alarm'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className={`h-4 w-4 ${vetting.safety_co ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className={`text-sm ${vetting.safety_co ? 'text-emerald-300' : 'text-slate-400'}`}>
              {vetting.safety_co === null ? 'CO alarm: N/A' : vetting.safety_co ? 'CO alarm' : 'No CO alarm'}
            </span>
          </div>
        </div>
      </div>

      {/* Review sample if available */}
      {vetting.review_sample && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Quote className="h-4 w-4 text-amber-400" />
            <h4 className="font-semibold text-white text-sm">Review Evidence</h4>
          </div>
          <blockquote className="border-l-2 border-amber-500/30 pl-4 text-sm text-slate-300 italic">
            "{vetting.review_sample}"
          </blockquote>
        </div>
      )}

      {/* Notes */}
      {vetting.notes && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 mt-0.5" />
            <p className="text-xs text-amber-200">{vetting.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
