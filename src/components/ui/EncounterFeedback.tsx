"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MOTION } from "@/config/motionPresets"

export type EncounterFeedbackTone = "success" | "warning" | "danger" | "neutral"

interface EncounterFeedbackProps {
  message: string | null
  tone?: EncounterFeedbackTone
}

const TONE_CLASS: Record<EncounterFeedbackTone, string> = {
  success: "text-[var(--accent-bright)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
  neutral: "text-[var(--muted)]",
}

export function EncounterFeedback({
  message,
  tone = "neutral",
}: EncounterFeedbackProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          key={message}
          role="status"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={MOTION.feedback}
          className={`mt-2 text-sm ${TONE_CLASS[tone]}`}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

export function feedbackToneFromMessage(message: string): EncounterFeedbackTone {
  const lower = message.toLowerCase()
  if (
    lower.includes("failed") ||
    lower.includes("severed") ||
    lower.includes("degraded")
  ) {
    return "danger"
  }
  if (
    lower.includes("lock") ||
    lower.includes("identified") ||
    lower.includes("confirmed") ||
    lower.includes("decoded")
  ) {
    return "success"
  }
  if (lower.includes("incorrect") || lower.includes("watching")) {
    return "warning"
  }
  return "neutral"
}
