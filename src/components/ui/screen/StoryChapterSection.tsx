import type { ReactNode } from "react"

interface StoryChapterSectionProps {
  chapterTitle: string
  children: ReactNode
}

export function StoryChapterSection({
  chapterTitle,
  children,
}: StoryChapterSectionProps) {
  return (
    <section className="space-y-3">
      <p className="sticky top-0 z-[1] bg-[var(--background)]/90 py-1 font-display text-xs uppercase tracking-[0.24em] text-[var(--accent-bright)] backdrop-blur-sm">
        Main Story · {chapterTitle}
      </p>
      <ul className="space-y-2">{children}</ul>
    </section>
  )
}
