import { createFileRoute } from '@tanstack/react-router'
import {
  Users,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Star,
  AlertTriangle,
  Waves,
  ShoppingBag,
  Mountain,
  Hotel,
  Sparkles,
  Quote,
  ExternalLink,
} from 'lucide-react'

export const Route = createFileRoute('/community')({
  component: CommunityPage,
})

interface Opinion {
  id: number
  username: string
  source: string
  sourceUrl?: string
  type: 'positive' | 'negative' | 'tip'
  category: string
  text: string
  date?: string
}

const opinions: Opinion[] = [
  // Positive - Snorkeling
  {
    id: 1,
    username: 'Sarahconnor1',
    source: 'Mumsnet',
    sourceUrl: 'https://www.mumsnet.com/talk/holidays/5016221-sharm-el-sheikh-the-good-and-bad',
    type: 'positive',
    category: 'Snorkeling',
    text: 'Snorkelling directly from the hotel beach in Sharks Bay area was incredible with no hassle from shopkeepers.',
  },
  {
    id: 2,
    username: 'BarrelOfOtters',
    source: 'Mumsnet',
    sourceUrl: 'https://www.mumsnet.com/talk/holidays/5016221-sharm-el-sheikh-the-good-and-bad',
    type: 'positive',
    category: 'Snorkeling',
    text: 'Snorkelling and diving, both amazing - with direct beach access from hotels being ideal.',
  },
  {
    id: 3,
    username: 'TripAdvisor User',
    source: 'TripAdvisor',
    sourceUrl: 'https://www.tripadvisor.com/ShowTopic-g297555-i9225-k14637270-Hotel_recommendations_for_snorkeling_off_the_beach-Sharm_El_Sheikh_South_Sinai_Red_Sea_and.html',
    type: 'positive',
    category: 'Snorkeling',
    text: 'The hotels around El Fanar have some of the best, if not THE best snorkeling from the coast in Sharm. Lots of unspoiled corals and many fish.',
  },
  // Positive - Activities
  {
    id: 4,
    username: 'Toooldforthis36',
    source: 'Mumsnet',
    sourceUrl: 'https://www.mumsnet.com/talk/holidays/5016221-sharm-el-sheikh-the-good-and-bad',
    type: 'positive',
    category: 'Activities',
    text: 'Excellent for snorkelling, water parks, and beach activities. Desert trips and Bedouin experiences were loved by our kids.',
  },
  {
    id: 5,
    username: 'Meagainnewname',
    source: 'Mumsnet',
    sourceUrl: 'https://www.mumsnet.com/talk/holidays/5016221-sharm-el-sheikh-the-good-and-bad',
    type: 'positive',
    category: 'Activities',
    text: 'Enjoyed boat trips to nature reserves and White Island. Planning return visits!',
  },
  {
    id: 6,
    username: 'CuriositysCat',
    source: 'Mumsnet',
    sourceUrl: 'https://www.mumsnet.com/talk/holidays/5016221-sharm-el-sheikh-the-good-and-bad',
    type: 'positive',
    category: 'Activities',
    text: 'Had amazing holidays pre-kids. Enjoyed Mt. Sinai climbing and camel rides.',
  },
  // Positive - Resorts
  {
    id: 7,
    username: 'TripAdvisor Reviewer',
    source: 'TripAdvisor',
    sourceUrl: 'https://www.tripadvisor.com/Hotel_Review-g297555-d4187044-Reviews-Swissotel_Sharm_EL_Sheikh_All_Inclusive_Collection-Sharm_El_Sheikh_South_Sinai_Red_Sea.html',
    type: 'positive',
    category: 'Resorts',
    text: 'Swissotel is an ultra all-inclusive resort designed so you don\'t really need to spend anything extra. Has its own waterpark with 13 slides!',
  },
  {
    id: 8,
    username: 'Regular Visitor',
    source: 'TripAdvisor',
    type: 'positive',
    category: 'Safety',
    text: 'We have stayed in Sharm nine times over six years. We have not experienced one problem. We find the people helpful, pleasant and kind.',
  },
  // Negative
  {
    id: 9,
    username: 'DSD9472',
    source: 'Mumsnet',
    sourceUrl: 'https://www.mumsnet.com/talk/holidays/5016221-sharm-el-sheikh-the-good-and-bad',
    type: 'negative',
    category: 'Hassle',
    text: 'Local town wasn\'t welcoming - felt harassed leaving hotels. Taxi drivers touted aggressively.',
  },
  {
    id: 10,
    username: 'BarrelOfOtters',
    source: 'Mumsnet',
    sourceUrl: 'https://www.mumsnet.com/talk/holidays/5016221-sharm-el-sheikh-the-good-and-bad',
    type: 'negative',
    category: 'Sightseeing',
    text: 'Nothing to walk round and see beyond water activities. Limited exploration opportunities.',
  },
  {
    id: 11,
    username: 'Octavia64',
    source: 'Mumsnet',
    sourceUrl: 'https://www.mumsnet.com/talk/holidays/5016221-sharm-el-sheikh-the-good-and-bad',
    type: 'negative',
    category: 'Shopping',
    text: 'A lot of hassle when shopping. Notes little of local interest nearby.',
  },
  {
    id: 12,
    username: 'Brendabigbaps',
    source: 'Mumsnet',
    sourceUrl: 'https://www.mumsnet.com/talk/holidays/5016221-sharm-el-sheikh-the-good-and-bad',
    type: 'negative',
    category: 'Activities',
    text: 'Limited activities outside the resort. Wouldn\'t return unless staying resort-focused.',
  },
  // Tips
  {
    id: 13,
    username: 'Forum Expert',
    source: 'TripAdvisor',
    sourceUrl: 'https://www.tripadvisor.ca/ShowTopic-g297555-i9225-k15350862-Tips-Sharm_El_Sheikh_South_Sinai_Red_Sea_and_Sinai.html',
    type: 'tip',
    category: 'Tipping',
    text: '40/50 EGP for a drinks waiter will get you excellent service. Tipping in EGP is recommended as pound coins are hard to exchange.',
  },
  {
    id: 14,
    username: 'Travel Expert',
    source: 'The Travel Mum',
    sourceUrl: 'https://thetravelmum.com/how-safe-is-sharm-el-sheikh/',
    type: 'tip',
    category: 'Safety',
    text: 'Never drink tap water, don\'t even use it to brush your teeth. Same applies to ice - ensure it\'s made from mineral water.',
  },
  {
    id: 15,
    username: 'Forum User',
    source: 'TripAdvisor',
    type: 'tip',
    category: 'Transport',
    text: 'All you need is to agree on price before getting into the taxi. Or use Uber taxis through the app.',
  },
  {
    id: 16,
    username: 'Local Guide',
    source: 'LocalGuideToEgypt',
    sourceUrl: 'https://www.localguidetoegypt.com/post/sharm-el-sheikh-egypt-a-travel-guide-for-first-timers',
    type: 'tip',
    category: 'Visa',
    text: 'If staying in Sinai for up to 15 days, you get a FREE Sinai Stamp - no visa needed! This covers Sharm, Dahab, Nuweiba and Taba.',
  },
]

function getCategoryIcon(category: string) {
  switch (category) {
    case 'Snorkeling':
      return <Waves className="h-4 w-4" />
    case 'Shopping':
    case 'Hassle':
      return <ShoppingBag className="h-4 w-4" />
    case 'Activities':
      return <Mountain className="h-4 w-4" />
    case 'Resorts':
      return <Hotel className="h-4 w-4" />
    default:
      return <MessageCircle className="h-4 w-4" />
  }
}

function OpinionCard({ opinion }: { opinion: Opinion }) {
  const typeStyles = {
    positive: 'border-emerald-500/30 bg-emerald-500/5',
    negative: 'border-rose-500/30 bg-rose-500/5',
    tip: 'border-amber-500/30 bg-amber-500/5',
  }

  const typeIcon = {
    positive: <ThumbsUp className="h-4 w-4 text-emerald-400" />,
    negative: <ThumbsDown className="h-4 w-4 text-rose-400" />,
    tip: <Sparkles className="h-4 w-4 text-amber-400" />,
  }

  return (
    <div className={`rounded-xl border p-4 ${typeStyles[opinion.type]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">{typeIcon[opinion.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">{opinion.username}</span>
            <span className="text-xs text-slate-500">•</span>
            {opinion.sourceUrl ? (
              <a
                href={opinion.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                {opinion.source}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-xs text-slate-500">{opinion.source}</span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                opinion.type === 'positive'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : opinion.type === 'negative'
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {opinion.category}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            <Quote className="inline h-3 w-3 text-slate-500 mr-1" />
            {opinion.text}
          </p>
        </div>
      </div>
    </div>
  )
}

function CommunityPage() {
  const positiveOpinions = opinions.filter((o) => o.type === 'positive')
  const negativeOpinions = opinions.filter((o) => o.type === 'negative')
  const tips = opinions.filter((o) => o.type === 'tip')

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
          <Users className="h-4 w-4" />
          Community Insights
        </div>
        <h1 className="text-3xl font-bold text-white">
          What Travelers Say About Sharm
        </h1>
        <p className="mt-2 text-slate-400">
          Real opinions from TripAdvisor, Mumsnet, and travel forums | 2024-2025
        </p>
      </div>

      {/* Hero Image */}
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src="/community-images/snorkeling-couple.jpg"
          alt="Couple snorkeling in Red Sea coral reef"
          className="h-64 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-lg font-medium text-white">
            "The coral reefs are some of the best in the world — vibrant, colorful, and teeming with life."
          </p>
          <p className="mt-1 text-sm text-slate-400">— The Elegant Wanderer</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{positiveOpinions.length}</p>
          <p className="text-xs text-slate-400">Positive Reviews</p>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
          <p className="text-2xl font-bold text-rose-400">{negativeOpinions.length}</p>
          <p className="text-xs text-slate-400">Things to Know</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{tips.length}</p>
          <p className="text-xs text-slate-400">Pro Tips</p>
        </div>
      </div>

      {/* The Good */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
            <ThumbsUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">What People Love</h2>
            <p className="text-xs text-slate-400">Highlights from real travelers</p>
          </div>
        </div>

        {/* Feature Images */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-xl">
            <img
              src="/community-images/resort-pool.jpg"
              alt="Luxury resort pool"
              className="h-40 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <p className="absolute bottom-2 left-3 text-sm font-medium text-white">
              World-class resorts
            </p>
          </div>
          <div className="relative overflow-hidden rounded-xl">
            <img
              src="/community-images/desert-safari.jpg"
              alt="Desert safari quad bikes"
              className="h-40 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            <p className="absolute bottom-2 left-3 text-sm font-medium text-white">
              Desert adventures
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {positiveOpinions.map((opinion) => (
            <OpinionCard key={opinion.id} opinion={opinion} />
          ))}
        </div>
      </section>

      {/* Things to Know */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Things to Know</h2>
            <p className="text-xs text-slate-400">Honest feedback to set expectations</p>
          </div>
        </div>

        {/* Market Image */}
        <div className="relative mb-4 overflow-hidden rounded-xl">
          <img
            src="/community-images/old-market.jpg"
            alt="Egyptian market bazaar"
            className="h-48 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            <p className="text-sm text-white">
              Markets can be intense — bargain hard and be prepared for some hassle
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {negativeOpinions.map((opinion) => (
            <OpinionCard key={opinion.id} opinion={opinion} />
          ))}
        </div>

        {/* Our Take */}
        <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
          <p className="text-sm text-cyan-200">
            <strong>Our take:</strong> Sharm is a resort destination, not a cultural exploration trip.
            Stay in Sharks Bay for the best balance — great snorkeling, less hassle, and a quick
            taxi ride to Naama Bay when you want nightlife or shopping.
          </p>
        </div>
      </section>

      {/* Pro Tips */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Pro Tips from Travelers</h2>
            <p className="text-xs text-slate-400">Advice to make your trip smoother</p>
          </div>
        </div>
        <div className="space-y-3">
          {tips.map((opinion) => (
            <OpinionCard key={opinion.id} opinion={opinion} />
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Star className="h-5 w-5 text-purple-400" />
          The Verdict
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-amber-200 font-medium mb-2">Perfect for you if:</p>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• You love snorkeling and water activities</li>
              <li>• You want a relaxing all-inclusive beach holiday</li>
              <li>• You're okay staying mostly at the resort</li>
              <li>• You want great value for luxury amenities</li>
            </ul>
          </div>
          <div>
            <p className="text-amber-200 font-medium mb-2">Maybe skip if:</p>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• You want authentic cultural immersion</li>
              <li>• You hate tourist-focused environments</li>
              <li>• You want lots of independent exploration</li>
              <li>• You're bothered by persistent vendors</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sources */}
      <div className="text-center text-xs text-slate-500">
        <p>
          Sources:{' '}
          <a
            href="https://www.mumsnet.com/talk/holidays/5016221-sharm-el-sheikh-the-good-and-bad"
            className="text-cyan-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mumsnet
          </a>
          {' | '}
          <a
            href="https://www.tripadvisor.com/ShowForum-g297555-i9225-Sharm_El_Sheikh_South_Sinai_Red_Sea_and_Sinai.html"
            className="text-cyan-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            TripAdvisor Forums
          </a>
          {' | '}
          <a
            href="https://thetravelmum.com/how-safe-is-sharm-el-sheikh/"
            className="text-cyan-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Travel Mum
          </a>
        </p>
      </div>
    </div>
  )
}
