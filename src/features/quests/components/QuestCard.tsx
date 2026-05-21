import type { QuestContract } from "@/contracts/quest-contract"

interface QuestCardProps {
  quest: QuestContract
  onProgress: () => void
  onComplete: () => void
  disabled?: boolean
}

export function QuestCard({
  quest,
  onProgress,
  onComplete,
  disabled,
}: QuestCardProps) {
  const objective = quest.objectives[0]
  const canComplete =
    objective &&
    objective.currentProgress >= objective.requiredProgress

  return (
    <article className="rounded border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[var(--accent)]">{quest.title}</h3>
        <span className="text-xs uppercase text-[var(--muted)]">
          {quest.type}
        </span>
      </div>
      <p className="mb-3 text-sm text-[var(--muted)]">{quest.description}</p>
      {objective && (
        <p className="mb-3 text-sm">
          {objective.description}: {objective.currentProgress}/
          {objective.requiredProgress}
        </p>
      )}
      <p className="mb-3 text-sm">Reward: {quest.rewards.xp} XP</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onProgress}
          className="rounded border border-white/20 px-3 py-1 text-sm hover:bg-white/10 disabled:opacity-50"
        >
          Progress
        </button>
        <button
          type="button"
          disabled={disabled || !canComplete}
          onClick={onComplete}
          className="rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
        >
          Complete
        </button>
      </div>
    </article>
  )
}
