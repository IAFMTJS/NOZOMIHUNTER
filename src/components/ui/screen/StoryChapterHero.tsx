interface StoryChapterHeroProps {
  chapterTitle: string
  progressPercent: number
  currentMission: number
  totalMissions: number
}

export function StoryChapterHero({
  chapterTitle,
  progressPercent,
  currentMission,
  totalMissions,
}: StoryChapterHeroProps) {
  return (
    <div className="nozomi-embedded rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
        Story arc
      </p>
      <p className="mt-1 font-display text-lg font-semibold text-[var(--foreground)]">
        {chapterTitle}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0">
          <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="var(--overlay-muted)"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="var(--accent-bright)"
              strokeWidth="3"
              strokeDasharray={`${progressPercent} 100`}
              strokeLinecap="round"
              pathLength={100}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-[10px] font-bold text-[var(--accent-bright)]">
            {progressPercent}%
          </span>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Mission {String(currentMission).padStart(2, "0")} of{" "}
          {String(totalMissions).padStart(2, "0")}
        </p>
      </div>
    </div>
  )
}
