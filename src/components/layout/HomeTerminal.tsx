"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import { buttonClassName } from "@/components/ui/Button"
import { LANDING_WHISPERS } from "@/config/landingWhispers"
import { GameAssetImage } from "@/components/ui/GameAssetImage"

const BOOT_LINES = [
  "NOZOMI HUNTER SYSTEM v1.5",
  "Linking mastery grid…",
  "Corruption sensors: online",
  "Awaiting hunter authentication",
] as const

export function HomeTerminal() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [ready, setReady] = useState(false)
  const [whisperIdx, setWhisperIdx] = useState(0)

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

  useEffect(() => {
    const id = window.setInterval(() => {
      setWhisperIdx((i) => (i + 1) % LANDING_WHISPERS.length)
    }, 6000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <main className="nozomi-landing-weather relative mx-auto flex min-h-screen max-w-lg flex-col justify-center overflow-hidden px-6 py-16">
      <div className="nozomi-landing-fog pointer-events-none absolute inset-0" aria-hidden />
      <div className="nozomi-landing-rain pointer-events-none absolute inset-0" aria-hidden />
      <div className="nozomi-hero-art-slot relative z-[1] mb-6">
        <GameAssetImage
          assetKey="hero.home.command"
          alt=""
          fill
          priority
          className="opacity-40"
        />
      </div>
      <div className="relative z-[1] nozomi-embedded mb-8 rounded-[var(--radius-panel)] p-6 font-mono text-sm">
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={MOTION.landing}
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
        transition={MOTION.landing}
        className="relative z-[1] text-center"
      >
        <p className="nozomi-landing-whisper mb-4 font-display" lang="ja">
          {LANDING_WHISPERS[whisperIdx]}
        </p>
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
