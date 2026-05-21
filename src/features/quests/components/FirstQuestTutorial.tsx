"use client"

import { useState } from "react"
import { TUTORIAL_STEPS } from "@/systems/tutorial/tutorialSystem"

interface FirstQuestTutorialProps {
  onDismiss: () => void
}

export function FirstQuestTutorial({ onDismiss }: FirstQuestTutorialProps) {
  const [step, setStep] = useState(0)
  const current = TUTORIAL_STEPS[step]
  const isLast = step >= TUTORIAL_STEPS.length - 1

  if (!current) return null

  return (
    <aside
      className="mb-6 rounded border border-[var(--accent)]/40 bg-[var(--accent)]/5 p-4"
      role="region"
      aria-label="First quest tutorial"
    >
      <p className="mb-1 text-xs uppercase tracking-wide text-[var(--accent)]">
        Hunter Briefing · {step + 1}/{TUTORIAL_STEPS.length}
      </p>
      <h3 className="mb-2 font-semibold">{current.title}</h3>
      <p className="mb-4 text-sm text-[var(--muted)]">{current.body}</p>
      <div className="flex gap-2">
        {!isLast ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)]"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)]"
          >
            Begin
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="rounded border border-white/20 px-3 py-1 text-sm text-[var(--muted)]"
        >
          Skip briefing
        </button>
      </div>
    </aside>
  )
}
