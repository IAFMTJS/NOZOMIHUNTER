"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import { buttonClassName } from "@/components/ui/Button"

const BOOT_LINES = [
  "NOZOMI HUNTER SYSTEM v0.6",
  "Linking mastery grid…",
  "Corruption sensors: online",
  "Awaiting hunter authentication",
] as const

export function HomeTerminal() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) {
      const t = window.setTimeout(() => setReady(true), 400)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(
      () => setVisibleLines((n) => n + 1),
      visibleLines === 0 ? 200 : 380
    )
    return () => window.clearTimeout(t)
  }, [visibleLines])

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <div className="nozomi-embedded mb-12 rounded-[var(--radius-panel)] p-6 font-mono text-sm">
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={MOTION.feedback}
            className={
              i === 0
                ? "font-display text-lg font-bold tracking-[0.14em] text-[var(--accent-bright)]"
                : "text-[var(--muted)]"
            }
          >
            {i > 0 && (
              <span className="mr-2 text-[var(--accent)]" aria-hidden>
                ›
              </span>
            )}
            {line}
          </motion.p>
        ))}
        {visibleLines < BOOT_LINES.length && (
          <span
            className="mt-2 inline-block h-4 w-2 animate-pulse bg-[var(--accent)]"
            aria-hidden
          />
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={MOTION.panel}
        className="text-center"
      >
        <p className="mb-8 text-sm leading-relaxed text-[var(--muted)]">
          Language is gameplay. Initialize your hunter session.
        </p>
        <Link
          href="/login"
          className={`${buttonClassName("primary", "md")} inline-flex w-full justify-center sm:w-auto`}
        >
          Initialize hunter
        </Link>
      </motion.div>
    </main>
  )
}
