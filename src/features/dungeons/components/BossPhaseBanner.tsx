"use client"

interface BossPhaseBannerProps {
  copy: string
}

export function BossPhaseBanner({ copy }: BossPhaseBannerProps) {
  return (
    <p className="mb-3 text-center text-[10px] uppercase tracking-[0.32em] text-[var(--danger)] animate-pulse">
      {copy}
    </p>
  )
}
