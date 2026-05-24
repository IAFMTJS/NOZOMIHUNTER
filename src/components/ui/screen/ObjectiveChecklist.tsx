import type { QuestContract } from "@/contracts/quest-contract"
import {
  isObjectiveRevealed,
  objectiveDisplayText,
} from "@/systems/quests/contractCatalogSystem"

interface ObjectiveChecklistProps {
  objectives: QuestContract["objectives"]
}

export function ObjectiveChecklist({ objectives }: ObjectiveChecklistProps) {
  return (
    <ul className="space-y-2">
      {objectives.map((obj) => {
        const revealed = isObjectiveRevealed(obj)
        const fraction =
          obj.requiredProgress > 0
            ? `${Math.min(obj.currentProgress, obj.requiredProgress)}/${obj.requiredProgress}`
            : null

        return (
          <li
            key={obj.id}
            className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-black/25 px-3 py-2.5"
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                obj.completed
                  ? "border-[var(--success)]/50 bg-[var(--success)]/15 text-[var(--success)]"
                  : revealed
                    ? "border-[var(--accent)]/40 text-[var(--accent-bright)]"
                    : "border-[var(--border-subtle)] text-[var(--muted)]"
              }`}
              aria-hidden
            >
              {obj.completed ? "✓" : revealed ? "○" : "·"}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm leading-snug ${
                  revealed ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                }`}
              >
                {objectiveDisplayText(obj)}
              </p>
              {revealed && fraction && !obj.completed && (
                <p className="mt-0.5 text-[10px] text-[var(--muted)]">{fraction}</p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
