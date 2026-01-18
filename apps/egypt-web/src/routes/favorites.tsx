import { createFileRoute } from '@tanstack/react-router'
import { Heart, Construction } from 'lucide-react'

export const Route = createFileRoute('/favorites')({
  component: FavoritesPage,
})

function FavoritesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
        <Heart className="h-10 w-10 text-rose-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Your Favorites</h1>
      <div className="flex items-center gap-2 text-amber-400 mb-4">
        <Construction className="h-4 w-4" />
        <span className="text-sm">Coming Soon</span>
      </div>
      <p className="text-slate-400 max-w-md">
        Save your favorite properties here for quick access. Click the heart icon on any property card to add it to your favorites.
      </p>
    </div>
  )
}
