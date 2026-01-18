import { createFileRoute } from '@tanstack/react-router'
import {
  Lightbulb,
  Plane,
  Bed,
  MapPin,
  Wallet,
  Sun,
  Compass,
  Utensils,
  Shield,
  AlertCircle,
  Check,
  X,
  Heart,
  Volume2,
  Moon,
} from 'lucide-react'

export const Route = createFileRoute('/tips')({
  component: TipsPage,
})

interface TipSectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  highlight?: boolean
}

function TipSection({ icon, title, children, highlight }: TipSectionProps) {
  return (
    <section
      className={`rounded-2xl border p-6 ${
        highlight
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent'
          : 'border-white/10 bg-white/5'
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-white/10 text-slate-400'
          }`}
        >
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="text-slate-300 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

function QuickFact({
  label,
  value,
  good,
}: {
  label: string
  value: string
  good?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2">
      <span className="text-sm text-slate-400">{label}</span>
      <span
        className={`font-medium ${good ? 'text-emerald-400' : 'text-white'}`}
      >
        {value}
      </span>
    </div>
  )
}

function TipsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero Image */}
      <div className="relative -mx-6 -mt-6 overflow-hidden rounded-b-3xl">
        <img
          src="/tips-images/hero-panorama.jpg"
          alt="Panoramic view of Sharm el Sheikh coastline"
          className="h-64 w-full object-cover sm:h-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-slate-950/80 backdrop-blur px-4 py-2 text-sm text-amber-200">
            <Lightbulb className="h-4 w-4" />
            Personalized for Henri & Evelina
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Your Egypt Travel Guide</h1>
          <p className="mt-2 text-slate-300">
            Feb 15-22, 2026 | Sharm el Sheikh | 7 nights
          </p>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickFact label="Visa" value="FREE!" good />
        <QuickFact label="Currency" value="1€ = ~50 EGP" />
        <QuickFact label="Weather" value="21-23°C" good />
        <QuickFact label="Time Zone" value="Same as Estonia" good />
      </div>

      {/* Priority Section - Evelina's Sleep */}
      <TipSection
        icon={<Moon className="h-5 w-5" />}
        title="Priority: Evelina's Quiet Sleep"
        highlight
      >
        <p>
          We've specifically searched for properties with{' '}
          <strong className="text-amber-200">separate bedrooms</strong> because
          Henri snores. All our top 10 properties have verified 2+ bedroom
          configurations for maximum comfort.
        </p>

        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
            <div>
              <p className="font-medium text-emerald-200">
                Sharks Bay is your best area
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Quietest beach area without being isolated. No nightlife noise -
                just waves. 5-7 min taxi to Naama Bay restaurants. Best
                snorkeling directly from hotel jetties.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-start gap-3">
            <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-400" />
            <div>
              <p className="font-medium text-rose-200">Avoid Naama Bay hotels</p>
              <p className="mt-1 text-sm text-slate-300">
                The nightlife hub - noisy at night. Great to visit, not to
                sleep.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm">
          <p className="text-amber-200 font-medium mb-2">
            When booking, request:
          </p>
          <ul className="space-y-1 text-slate-300">
            <li>• Room away from pool/entertainment area</li>
            <li>• Higher floor (less foot traffic noise)</li>
            <li>• Room facing the sea (not the road)</li>
            <li>• Confirm separate bedrooms are truly separate</li>
          </ul>
        </div>
      </TipSection>

      {/* Visa */}
      <TipSection icon={<Plane className="h-5 w-5" />} title="Visa: You Don't Need One!">
        <p>
          <strong className="text-emerald-400">Good news!</strong> Estonian citizens
          get{' '}
          <strong className="text-white">FREE entry for stays up to 15 days</strong>{' '}
          when staying only in Sharm el Sheikh (Sinai resorts exemption).
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            Just get a free stamp at the airport
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            No eVisa or Visa on Arrival needed
          </li>
        </ul>
        <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm">
          <AlertCircle className="inline h-4 w-4 text-amber-400 mr-2" />
          <strong className="text-amber-200">Cairo day trip?</strong> You'll
          need a visa. Apply for eVisa 3-7 days before, or get Visa on Arrival.
          Our recommendation: skip Cairo - Sharm has plenty to do.
        </div>
      </TipSection>

      {/* Money */}
      <TipSection icon={<Wallet className="h-5 w-5" />} title="Money & Tipping">
        <div className="mb-4 overflow-hidden rounded-xl">
          <img
            src="/tips-images/egyptian-money.jpg"
            alt="Egyptian pound banknotes and coins"
            className="h-32 w-full object-cover"
          />
        </div>
        <p>
          <strong className="text-white">Always pay in Egyptian Pounds (EGP)</strong>{' '}
          for better rates. €1 = approximately 50 EGP. ATMs are widely
          available, but carry cash for tips and small vendors.
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            Tipping Guide
          </div>
          <div className="divide-y divide-white/5">
            {[
              ['Restaurant', '10-15% if not included'],
              ['Housekeeping', '10-15 EGP/day'],
              ['Luggage porter', '5-10 EGP/bag'],
              ['Tour guide', '10-15% of tour cost'],
              ['Taxi', 'Round up or 10%'],
              ['Snorkel boat crew', '20-50 EGP'],
            ].map(([service, tip]) => (
              <div
                key={service}
                className="flex justify-between px-4 py-2 text-sm"
              >
                <span className="text-slate-400">{service}</span>
                <span className="text-white">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm space-y-1">
          <p>
            <AlertCircle className="inline h-4 w-4 text-amber-400 mr-1" />
            Tip in EGP only - EUR coins can't be exchanged!
          </p>
          <p>
            <AlertCircle className="inline h-4 w-4 text-amber-400 mr-1" />
            Get small notes at airport: 10, 20, 50 EGP
          </p>
          <p>
            <AlertCircle className="inline h-4 w-4 text-amber-400 mr-1" />
            Restaurant bills often include 22-25% tax+service already
          </p>
        </div>
      </TipSection>

      {/* Weather & Packing */}
      <TipSection icon={<Sun className="h-5 w-5" />} title="February Weather & Packing">
        <div className="mb-4 overflow-hidden rounded-xl">
          <img
            src="/tips-images/packing-essentials.jpg"
            alt="Beach vacation packing essentials"
            className="h-40 w-full object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">21-23°C</p>
            <p className="text-xs text-slate-400">Day temperature</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <p className="text-2xl font-bold text-cyan-400">11-12°C</p>
            <p className="text-xs text-slate-400">Night temperature</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">22°C</p>
            <p className="text-xs text-slate-400">Water temperature</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">Breezy</p>
            <p className="text-xs text-slate-400">Afternoon wind</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-amber-200 font-medium mb-2">Packing essentials:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              'Light layers for evenings',
              'Reef-safe sunscreen (SPF 50)',
              'Rashguard for snorkeling',
              'Reef shoes (coral is sharp!)',
              'Hat and sunglasses',
              'Light scarf for Evelina (mosques)',
              'Power adapter (Type C, EU)',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-slate-300">
                <Check className="h-3 w-3 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </TipSection>

      {/* Activities */}
      <TipSection
        icon={<Compass className="h-5 w-5" />}
        title="Must-Do Activities"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
            <img
              src="/tips-images/ras-mohammed-reef.jpg"
              alt="Colorful coral reef with tropical fish at Ras Mohammed"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-medium text-emerald-300 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs">
                  1
                </span>
                Ras Mohammed National Park
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                World-class snorkeling with 1000+ fish species. Full day tour
                ~€45. February = excellent visibility. <strong>Book in advance!</strong>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
            <img
              src="/tips-images/desert-safari.jpg"
              alt="Quad bikes in Sinai desert at sunset"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-medium text-amber-300 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs">
                  2
                </span>
                Desert Safari + Bedouin Dinner
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Quad bikes across Sinai desert, sunset camel ride (great photos!),
                BBQ under stars + fire show. Henri: you can upgrade to a 2-seater
                buggy.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 overflow-hidden">
            <img
              src="/tips-images/sharks-bay-jetty.jpg"
              alt="Wooden jetty at Sharks Bay with crystal clear water"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-medium text-cyan-300 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs">
                  3
                </span>
                Sharks Bay House Reef
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                FREE with your hotel! Snorkel directly from the jetty, no boat
                needed. Perfect for relaxed, repeated snorkeling sessions.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
            <img
              src="/tips-images/tiran-dolphins.jpg"
              alt="Dolphins swimming near boat at Tiran Island"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-medium text-purple-300 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs">
                  4
                </span>
                Tiran Island Boat Trip
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Four famous reefs, possible dolphin sightings. Full day on the
                water - bring sunscreen!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Skip unless you're passionate
          </p>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>
              • <strong>Mount Sinai</strong> - Overnight trip, depart 2:30 AM,
              exhausting climb
            </li>
            <li>
              • <strong>Petra</strong> - 2:30 AM departure, 18+ hour day
            </li>
            <li>
              • <strong>Cairo</strong> - Requires visa, long day
            </li>
          </ul>
        </div>
      </TipSection>

      {/* Dining */}
      <TipSection icon={<Utensils className="h-5 w-5" />} title="Where to Eat">
        <div className="mb-4 overflow-hidden rounded-xl">
          <img
            src="/tips-images/egyptian-food.jpg"
            alt="Traditional Egyptian cuisine spread with falafel, hummus, and grilled meats"
            className="h-40 w-full object-cover"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-amber-200 font-medium mb-2">
              First Night (Easy, Familiar)
            </p>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>
                • <strong>Pomodoro</strong> - Best pizza in Sharm
              </li>
              <li>
                • <strong>Al Fanar</strong> - Italian with beach view
              </li>
            </ul>
          </div>

          <div>
            <p className="text-amber-200 font-medium mb-2">
              Try Egyptian Food
            </p>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>
                • <strong>Fares Seafood</strong> - Fresh fish by weight
              </li>
              <li>
                • <strong>Sinai Star</strong> - Traditional since 1985
              </li>
            </ul>
          </div>

          <div>
            <p className="text-amber-200 font-medium mb-2">Experience</p>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>
                • <strong>Farsha Cafe</strong> - Cliff-side sunset drinks
              </li>
              <li>
                • <strong>Tam Tam</strong> - Rooftop Middle Eastern
              </li>
            </ul>
          </div>

          <div>
            <p className="text-amber-200 font-medium mb-2">Must-Try Dishes</p>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• <strong>Koshary</strong> - National dish</li>
              <li>• <strong>Fresh grilled fish</strong> - Order by weight</li>
              <li>• <strong>Kunafa</strong> - Sweet cheese pastry</li>
            </ul>
          </div>
        </div>
      </TipSection>

      {/* Safety */}
      <TipSection icon={<Shield className="h-5 w-5" />} title="Safety Notes">
        <p>
          Sharm el Sheikh is <strong className="text-emerald-400">very safe</strong>{' '}
          for tourists. Heavily policed tourist areas, security checkpoints on
          roads. Most governments exempt Sharm from Sinai travel warnings.
        </p>

        <div className="mt-4 space-y-2 text-sm">
          <p className="text-amber-200 font-medium">Still be smart:</p>
          <ul className="space-y-1 text-slate-300">
            <li>• Don't walk alone at night in deserted areas</li>
            <li>• Decline "free" offers from strangers</li>
            <li>• Keep valuables in hotel safe</li>
            <li>
              • Evelina: Dress modestly outside beach/pool (shoulders, knees
              covered)
            </li>
          </ul>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <p className="text-lg font-bold text-white">122</p>
            <p className="text-xs text-slate-400">Police</p>
          </div>
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <p className="text-lg font-bold text-white">123</p>
            <p className="text-xs text-slate-400">Ambulance</p>
          </div>
        </div>
      </TipSection>

      {/* Airport */}
      <TipSection icon={<Plane className="h-5 w-5" />} title="Airport & Transfers">
        <div className="mb-4 overflow-hidden rounded-xl">
          <img
            src="/tips-images/airport-transfer.jpg"
            alt="Airport arrival hall with luggage and transfer services"
            className="h-32 w-full object-cover"
          />
        </div>
        <p>
          Sharm Airport (SSH) is just 15-20 minutes to most hotel areas.
        </p>

        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="font-medium text-emerald-300">Recommended: Pre-book transfer</p>
          <p className="mt-1 text-sm text-slate-300">
            ~€10 total, stress-free arrival. Book through KiwiTaxi, Suntransfers,
            or your hotel.
          </p>
        </div>

        <p className="mt-3 text-sm text-slate-400">
          Alternative: Negotiate taxi on arrival - expect haggling!
        </p>
      </TipSection>

      {/* Final Note */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 text-center">
        <Heart className="mx-auto h-8 w-8 text-amber-400" />
        <p className="mt-3 text-lg font-medium text-white">
          Have an amazing trip, Henri & Evelina!
        </p>
        <p className="mt-1 text-sm text-slate-400">
          All properties in our top 10 have been verified for separate bedrooms
          to ensure a restful vacation.
        </p>
      </div>
    </div>
  )
}
