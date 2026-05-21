interface XPBarProps {
  currentXP: number
  requiredXP: number
  level: number
}

export function XPBar({ currentXP, requiredXP, level }: XPBarProps) {
  const percentage =
    requiredXP > 0 ? Math.min(100, (currentXP / requiredXP) * 100) : 0

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm text-[var(--muted)]">
        <span>Level {level}</span>
        <span>
          {currentXP} / {requiredXP} XP
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded bg-black/50">
        <div
          className="h-full rounded bg-[var(--accent)] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
