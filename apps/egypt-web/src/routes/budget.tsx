import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  Calculator,
  Plane,
  Home,
  Utensils,
  Compass,
  Wallet,
  Car,
  Gift,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'

export const Route = createFileRoute('/budget')({
  component: BudgetPage,
})

interface BudgetItem {
  label: string
  amount: number
  perPerson?: boolean
  note?: string
}

function BudgetSection({
  icon: Icon,
  title,
  items,
  color,
  collapsed,
  onToggle,
}: {
  icon: typeof Calculator
  title: string
  items: BudgetItem[]
  color: string
  collapsed: boolean
  onToggle: () => void
}) {
  const total = items.reduce((sum, item) => sum + item.amount * (item.perPerson ? 2 : 1), 0)

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${color}`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-xs text-slate-400">{items.length} items</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white">€{total.toLocaleString()}</span>
          {collapsed ? (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </button>

      {!collapsed && (
        <div className="mt-4 space-y-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">{item.label}</span>
                {item.perPerson && (
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">
                    ×2
                  </span>
                )}
                {item.note && (
                  <span className="text-[10px] text-slate-500">({item.note})</span>
                )}
              </div>
              <span className="font-medium text-white">
                €{(item.amount * (item.perPerson ? 2 : 1)).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BudgetPage() {
  const [accommodation, setAccommodation] = useState(2385) // White Hills Family Suite
  const [flightPerPerson, setFlightPerPerson] = useState(350)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // Activity costs based on activities.json research
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    'ras-mohammed',
    'desert-safari',
    'old-market',
  ])

  const activityOptions = [
    { id: 'ras-mohammed', label: 'Ras Mohammed Snorkeling', cost: 50 },
    { id: 'tiran-island', label: 'Tiran Island Boat Trip', cost: 55 },
    { id: 'white-island', label: 'White Island Cruise', cost: 60 },
    { id: 'desert-safari', label: 'Desert Safari + Dinner', cost: 45 },
    { id: 'blue-hole', label: 'Blue Hole Day Trip', cost: 65 },
    { id: 'mount-sinai', label: 'Mount Sinai Sunrise', cost: 75 },
    { id: 'glass-boat', label: 'Glass Bottom Boat', cost: 28 },
    { id: 'farsha-cafe', label: 'Farsha Cafe Sunset', cost: 30 },
    { id: 'old-market', label: 'Old Market Shopping', cost: 50 },
    { id: 'el-fanar', label: 'El Fanar Beach Day', cost: 20 },
  ]

  // Daily expenses
  const [dailyFood, setDailyFood] = useState(0) // 0 if all-inclusive
  const [isAllInclusive, setIsAllInclusive] = useState(true)
  const nights = 7

  const flightItems: BudgetItem[] = [
    { label: 'Round trip flight', amount: flightPerPerson, perPerson: true, note: 'TLL→SSH' },
  ]

  const accommodationItems: BudgetItem[] = [
    { label: `${nights} nights accommodation`, amount: accommodation },
  ]

  const activityItems: BudgetItem[] = selectedActivities.map((id) => {
    const activity = activityOptions.find((a) => a.id === id)
    return {
      label: activity?.label || id,
      amount: activity?.cost || 0,
      perPerson: true,
    }
  })

  const dailyItems: BudgetItem[] = [
    ...(isAllInclusive
      ? []
      : [{ label: `Food & drinks (${nights} days)`, amount: dailyFood * nights, perPerson: true }]),
    { label: 'Airport transfers', amount: 20 },
    { label: 'Local transport', amount: 30 },
    { label: 'Tips & small expenses', amount: 50 },
    { label: 'SIM card / data', amount: 15, perPerson: true },
    { label: 'Souvenirs & gifts', amount: 50 },
  ]

  const totals = useMemo(() => {
    const flights = flightPerPerson * 2
    const activities = activityItems.reduce(
      (sum, item) => sum + item.amount * (item.perPerson ? 2 : 1),
      0
    )
    const daily = dailyItems.reduce(
      (sum, item) => sum + item.amount * (item.perPerson ? 2 : 1),
      0
    )
    const total = flights + accommodation + activities + daily

    return { flights, accommodation, activities, daily, total }
  }, [flightPerPerson, accommodation, activityItems, dailyItems, isAllInclusive, dailyFood])

  const toggleCollapse = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          <Calculator className="h-4 w-4" />
          Trip Budget Calculator
        </div>
        <h1 className="text-3xl font-bold text-white">Egypt Trip Budget</h1>
        <p className="mt-2 text-slate-400">
          Feb 15-22, 2026 | 7 nights | 2 travelers
        </p>
      </div>

      {/* Total Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-400/70">Estimated Total</p>
            <p className="text-4xl font-bold text-white">€{totals.total.toLocaleString()}</p>
            <p className="text-sm text-slate-400">
              €{Math.round(totals.total / 2).toLocaleString()} per person
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl bg-white/5 px-4 py-2 text-center">
              <p className="text-lg font-bold text-cyan-400">
                €{Math.round(totals.total / nights).toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">per night</p>
            </div>
            <div className="rounded-xl bg-white/5 px-4 py-2 text-center">
              <p className="text-lg font-bold text-purple-400">
                €{Math.round(totals.total / nights / 2).toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">per person/night</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Sections */}
      <div className="space-y-4">
        {/* Flights */}
        <BudgetSection
          icon={Plane}
          title="Flights"
          items={flightItems}
          color="from-blue-500/10 to-transparent border-blue-500/20"
          collapsed={collapsed.flights}
          onToggle={() => toggleCollapse('flights')}
        />

        {/* Flight Input */}
        {!collapsed.flights && (
          <div className="ml-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <label className="block text-sm text-slate-400 mb-2">
              Flight cost per person (€)
            </label>
            <input
              type="number"
              value={flightPerPerson}
              onChange={(e) => setFlightPerPerson(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-amber-500/50 focus:outline-none"
            />
            <p className="mt-2 text-xs text-slate-500">
              <Info className="inline h-3 w-3 mr-1" />
              Check Skyscanner, Google Flights, or Kiwi.com for best deals
            </p>
          </div>
        )}

        {/* Accommodation */}
        <BudgetSection
          icon={Home}
          title="Accommodation"
          items={accommodationItems}
          color="from-emerald-500/10 to-transparent border-emerald-500/20"
          collapsed={collapsed.accommodation}
          onToggle={() => toggleCollapse('accommodation')}
        />

        {/* Accommodation Input */}
        {!collapsed.accommodation && (
          <div className="ml-4 space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Total accommodation cost (€)
              </label>
              <input
                type="number"
                value={accommodation}
                onChange={(e) => setAccommodation(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={isAllInclusive}
                  onChange={(e) => setIsAllInclusive(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-amber-500"
                />
                All-Inclusive (food & drinks included)
              </label>
            </div>
            {!isAllInclusive && (
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Daily food budget per person (€)
                </label>
                <input
                  type="number"
                  value={dailyFood}
                  onChange={(e) => setDailyFood(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Activities */}
        <BudgetSection
          icon={Compass}
          title="Activities & Tours"
          items={activityItems}
          color="from-purple-500/10 to-transparent border-purple-500/20"
          collapsed={collapsed.activities}
          onToggle={() => toggleCollapse('activities')}
        />

        {/* Activities Selection */}
        {!collapsed.activities && (
          <div className="ml-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <label className="block text-sm text-slate-400 mb-3">
              Select planned activities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {activityOptions.map((activity) => (
                <label
                  key={activity.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    selectedActivities.includes(activity.id)
                      ? 'border-purple-500/50 bg-purple-500/10 text-purple-200'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(activity.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedActivities([...selectedActivities, activity.id])
                        } else {
                          setSelectedActivities(selectedActivities.filter((id) => id !== activity.id))
                        }
                      }}
                      className="rounded border-white/20 bg-white/5 text-purple-500"
                    />
                    <span className="text-sm">{activity.label}</span>
                  </div>
                  <span className="text-xs text-slate-500">€{activity.cost}/pp</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Daily Expenses */}
        <BudgetSection
          icon={Wallet}
          title="Daily Expenses"
          items={dailyItems}
          color="from-cyan-500/10 to-transparent border-cyan-500/20"
          collapsed={collapsed.daily}
          onToggle={() => toggleCollapse('daily')}
        />
      </div>

      {/* Budget Breakdown Chart */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="font-semibold text-white mb-4">Budget Breakdown</h3>
        <div className="space-y-3">
          {[
            { label: 'Flights', value: totals.flights, color: 'bg-blue-500' },
            { label: 'Accommodation', value: totals.accommodation, color: 'bg-emerald-500' },
            { label: 'Activities', value: totals.activities, color: 'bg-purple-500' },
            { label: 'Daily Expenses', value: totals.daily, color: 'bg-cyan-500' },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{item.label}</span>
                <span className="text-white">
                  €{item.value.toLocaleString()} ({Math.round((item.value / totals.total) * 100)}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${(item.value / totals.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          Budget Tips
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-300">
          <div>
            <p>
              <strong className="text-amber-200">Pay in EGP:</strong> Always pay in Egyptian
              Pounds for better exchange rates
            </p>
          </div>
          <div>
            <p>
              <strong className="text-amber-200">Book through hotel:</strong> Activities are
              10-20% cheaper when booked via your hotel
            </p>
          </div>
          <div>
            <p>
              <strong className="text-amber-200">Bargain:</strong> In Old Market, start at 50%
              of asking price
            </p>
          </div>
          <div>
            <p>
              <strong className="text-amber-200">ATM fees:</strong> Use Wise or Revolut card
              for best exchange rates
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
