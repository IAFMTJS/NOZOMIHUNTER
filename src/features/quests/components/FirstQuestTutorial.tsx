"use client"

import { useState } from "react"
import { TUTORIAL_STEPS } from "@/systems/tutorial/tutorialSystem"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"

interface FirstQuestTutorialProps {
  onDismiss: () => void
}

export function FirstQuestTutorial({ onDismiss }: FirstQuestTutorialProps) {
  const [step, setStep] = useState(0)
  const current = TUTORIAL_STEPS[step]
  const isLast = step >= TUTORIAL_STEPS.length - 1

  if (!current) return null

  return (
    <Panel
      as="aside"
      tone="accent"
      className="mb-6"
      role="region"
      aria-label="First quest tutorial"
    >
      <p className="mb-1 font-display text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
        Hunter briefing · {step + 1}/{TUTORIAL_STEPS.length}
      </p>
      <h3 className="mb-2 font-display font-semibold">{current.title}</h3>
      <p className="mb-4 text-sm text-[var(--muted)]">{current.body}</p>
      <div className="flex gap-2">
        {!isLast ? (
          <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
        ) : (
          <Button onClick={onDismiss}>Begin</Button>
        )}
        <Button variant="ghost" onClick={onDismiss}>
          Skip briefing
        </Button>
      </div>
    </Panel>
  )
}
