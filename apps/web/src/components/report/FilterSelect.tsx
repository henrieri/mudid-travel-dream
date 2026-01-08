import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

type Option = {
  label: string
  value: string
}

type FilterSelectProps = {
  label?: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  ariaLabel: string
  size?: 'sm' | 'md'
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  ariaLabel,
  size = 'md',
}: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const selected =
    options.find((option) => option.value === value)?.label ?? value

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const sizeClasses =
    size === 'sm'
      ? 'rounded-full px-2 py-1 text-[10px]'
      : 'rounded-xl px-3 py-2 text-xs'
  const menuSizeClasses =
    size === 'sm' ? 'mt-1 w-36 text-[10px]' : 'mt-2 w-48 text-xs'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 border border-white/10 bg-slate-950/80 text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-cyan-400/40 ${sizeClasses}`}
      >
        {label ? <span className="text-slate-500">{label}</span> : null}
        <span className="font-medium">{selected}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
      </button>
      {open ? (
        <div
          className={`absolute right-0 z-20 rounded-2xl border border-white/10 bg-slate-950/95 p-2 text-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur ${menuSizeClasses}`}
        >
          <ul role="listbox" className="space-y-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                    option.value === value
                      ? 'bg-cyan-500/15 text-cyan-100'
                      : 'text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{option.label}</span>
                  {option.value === value ? (
                    <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-200">
                      Active
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
