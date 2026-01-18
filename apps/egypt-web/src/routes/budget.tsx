import { createFileRoute } from '@tanstack/react-router'
import { Calculator, Construction } from 'lucide-react'

export const Route = createFileRoute('/budget')({
  component: BudgetPage,
})

function BudgetPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <Calculator className="h-10 w-10 text-emerald-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Budget Calculator</h1>
      <div className="flex items-center gap-2 text-amber-400 mb-4">
        <Construction className="h-4 w-4" />
        <span className="text-sm">Coming Soon</span>
      </div>
      <p className="text-slate-400 max-w-md">
        Calculate your total trip budget including accommodation, flights, activities, and daily expenses for Sharm el Sheikh.
      </p>
    </div>
  )
}
