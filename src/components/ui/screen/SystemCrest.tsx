interface SystemCrestProps {
  className?: string
}

export function SystemCrest({ className = "" }: SystemCrestProps) {
  return (
    <div
      className={`mx-auto flex h-20 w-20 items-center justify-center ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 80 80" className="h-full w-full">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <path
          d="M40 12 L52 28 L68 32 L56 44 L58 60 L40 52 L22 60 L24 44 L12 32 L28 28 Z"
          fill="var(--accent)"
          fillOpacity="0.2"
          stroke="var(--accent-bright)"
          strokeWidth="1"
        />
        <text
          x="40"
          y="44"
          textAnchor="middle"
          fontSize="14"
          fill="var(--foreground)"
          fontFamily="var(--font-display-family)"
        >
          望
        </text>
      </svg>
    </div>
  )
}
