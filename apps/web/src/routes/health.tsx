import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/health')({
  component: HealthCheck,
})

function HealthCheck() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <span className="text-sm text-slate-400">ok</span>
    </div>
  )
}
