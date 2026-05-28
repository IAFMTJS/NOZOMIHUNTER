import { StatusChip } from "@/components/ui/StatusChip"

interface LoadoutSlot {
  id: string
  label: string
  equipped?: string | null
  level?: number
}

interface LoadoutSlotGridProps {
  buildName?: string
  buffs?: string[]
  slots?: LoadoutSlot[]
}

const DEFAULT_SLOTS: LoadoutSlot[] = [
  { id: "gear-1", label: "Gear I", equipped: "Listening rig", level: 2 },
  { id: "gear-2", label: "Gear II", equipped: "Field lexicon", level: 1 },
  { id: "gear-3", label: "Gear III", equipped: null },
]

export function LoadoutSlotGrid({
  buildName = "Listening Build",
  buffs = ["Focus increase", "Word detection"],
  slots = DEFAULT_SLOTS,
}: LoadoutSlotGridProps) {
  return (
    <div className="nozomi-embedded rounded-2xl p-4">
      <p className="font-display text-sm font-semibold text-[var(--foreground)]">
        {buildName}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {buffs.map((b) => (
          <StatusChip key={b} label={b} tone="accent" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--overlay-panel-strong)] p-2 text-center"
          >
            <p className="text-[9px] uppercase tracking-wider text-[var(--muted)]">
              {slot.label}
            </p>
            <p className="mt-1 line-clamp-2 text-[10px] font-medium text-[var(--foreground)]">
              {slot.equipped ?? "Empty"}
            </p>
            {slot.level != null && slot.equipped && (
              <p className="mt-1 text-[9px] text-[var(--accent-bright)]">Lv {slot.level}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
