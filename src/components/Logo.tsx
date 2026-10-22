import { Check } from 'lucide-react'

export function Logo() {
  return (
    <span className="flex items-center gap-2.5 text-[17px] font-bold tracking-tight">
      <span className="grid size-8 place-items-center rounded-[10px] bg-brand">
        <Check className="size-[18px] text-accent-bright" strokeWidth={3.2} aria-hidden="true" />
      </span>
      <span>
        Remember-<span className="text-brand-text">tasks</span>
      </span>
    </span>
  )
}
