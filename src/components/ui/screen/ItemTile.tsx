import { iconLabel } from "@/config/uiIconTokens"

interface ItemTileProps {
  iconKey: string
  name: string
  quantity: number
  equipped?: boolean
  selected?: boolean
  sellPrice?: number
  onClick?: () => void
  disabled?: boolean
}

export function ItemTile({
  iconKey,
  name,
  quantity,
  equipped,
  selected,
  sellPrice,
  onClick,
  disabled,
}: ItemTileProps) {
  const Tag = onClick ? "button" : "div"
  return (
    <Tag
      type={onClick ? "button" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border p-2 text-center transition-colors ${
        selected || equipped
          ? "border-[var(--accent-bright)] bg-[var(--accent)]/20"
          : "border-[var(--border-subtle)] bg-[var(--overlay-panel-strong)]"
      } ${onClick && !disabled ? "cursor-pointer hover:border-[var(--accent)]" : ""} ${disabled ? "opacity-50" : ""}`}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 text-[var(--accent-bright)]"
        aria-hidden
      >
        <rect
          x="4"
          y="8"
          width="24"
          height="18"
          rx="3"
          fill="currentColor"
          opacity="0.15"
        />
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fontSize="8"
          fill="currentColor"
          fontFamily="var(--font-display-family)"
        >
          {iconLabel(iconKey)}
        </text>
      </svg>
      <span className="mt-1 line-clamp-2 text-[9px] text-[var(--foreground)]">
        {name}
      </span>
      <span className="absolute right-1 top-1 rounded bg-[var(--accent)] px-1 text-[9px] font-bold text-white">
        {quantity}
      </span>
      {equipped && (
        <span className="absolute bottom-1 left-1 text-[8px] uppercase text-[var(--accent-bright)]">
          EQ
        </span>
      )}
      {sellPrice != null && sellPrice > 0 && (
        <span className="absolute bottom-1 right-1 text-[8px] tabular-nums text-[var(--reward)]">
          +{sellPrice}
        </span>
      )}
    </Tag>
  )
}
