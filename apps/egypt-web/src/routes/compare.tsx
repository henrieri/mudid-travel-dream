import { createFileRoute } from '@tanstack/react-router'
import { Scale, Construction } from 'lucide-react'

export const Route = createFileRoute('/compare')({
  component: ComparePage,
})

function ComparePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
        <Scale className="h-10 w-10 text-cyan-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Compare Properties</h1>
      <div className="flex items-center gap-2 text-amber-400 mb-4">
        <Construction className="h-4 w-4" />
        <span className="text-sm">Coming Soon</span>
      </div>
      <p className="text-slate-400 max-w-md">
        Compare multiple properties side-by-side. Select properties from the rankings page to add them to your comparison.
      </p>
    </div>
  )
}
