interface AudioWaveformProps {
  levels: number[]
  active?: boolean
  className?: string
}

export function AudioWaveform({
  levels,
  active = false,
  className = "",
}: AudioWaveformProps) {
  return (
    <div
      className={`flex h-14 items-end justify-center gap-1 ${className}`}
      aria-hidden
    >
      {levels.map((level, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-[height] duration-75 ${
            active ? "bg-[var(--accent)]/90" : "bg-[var(--accent)]/40"
          }`}
          style={{ height: `${8 + level * 28}px` }}
        />
      ))}
    </div>
  )
}
