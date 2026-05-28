#!/usr/bin/env node
/**
 * Replaces hardcoded rgba/hex in presentation.css with semantic theme variables.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const file = join(import.meta.dirname, "../src/styles/themes/presentation.css")

/** @type {Record<string, string>} */
const MAP = {
  "rgba(11, 16, 32, 0.85)": "var(--surface-a85)",
  "rgba(5, 7, 11, 0.4)": "var(--base-a40)",
  "rgba(255, 255, 255, 0.04)": "var(--white-a04)",
  "rgba(122, 92, 255, 0.12)": "var(--accent-a12)",
  "rgba(11, 16, 32, 0.75)": "var(--surface-a75)",
  "rgba(5, 7, 11, 0.35)": "var(--base-a35)",
  "rgba(122, 92, 255, 0.55)": "var(--accent-a55)",
  "rgba(0, 0, 0, 0.5)": "var(--black-a50)",
  "rgba(122, 92, 255, 0.06)": "var(--accent-a06)",
  "rgba(11, 16, 32, 0.9)": "var(--surface-a90)",
  "rgba(0, 0, 0, 0.028)": "var(--black-a28)",
  "rgba(0, 0, 0, 0.52)": "var(--black-a52)",
  "rgba(122, 92, 255, 0.05)": "var(--accent-a05)",
  "rgba(0, 0, 0, 0.014)": "var(--black-a014)",
  "rgba(0, 0, 0, 0.38)": "var(--black-a38)",
  "rgba(122, 92, 255, 0.5)": "var(--accent-a50)",
  "rgba(168, 85, 247, 0.045)": "var(--corruption-a045)",
  "rgba(168, 85, 247, 0.25)": "var(--corruption-a25)",
  "rgba(122, 92, 255, 0.45)": "var(--accent-a45)",
  "rgba(255, 77, 109, 0.4)": "var(--danger-a40)",
  "rgba(255, 77, 109, 0.15)": "var(--danger-a15)",
  "rgba(255, 77, 109, 0.25)": "var(--danger-a25)",
  "rgba(255, 77, 109, 0.35)": "var(--danger-a35)",
  "rgba(168, 85, 247, 0.45)": "var(--corruption-a45)",
  "rgba(122, 92, 255, 0.08)": "var(--accent-a08)",
  "rgba(255, 77, 109, 0.04)": "var(--danger-a04)",
  "rgba(5, 7, 11, 0.55)": "var(--base-a55)",
  "rgba(255, 255, 255, 0.03)": "var(--white-a03)",
  "rgba(255, 184, 77, 0.35)": "var(--reward-a35)",
  "rgba(120, 90, 180, 0.35)": "var(--shop-shadow-a35)",
  "rgba(255, 220, 140, 0.4)": "var(--shop-divine-a40)",
  "rgba(255, 184, 77, 0.25)": "var(--reward-a25)",
  "rgba(122, 92, 255, 0.18)": "var(--accent-a18)",
  "rgba(0, 0, 0, 0.35)": "var(--black-a35)",
  "rgba(122, 92, 255, 0.38)": "var(--accent-a38)",
  "rgba(255, 255, 255, 0.05)": "var(--white-a05)",
  "rgba(0, 0, 0, 0.4)": "var(--black-a40)",
  "rgba(255, 184, 77, 0.45)": "var(--reward-a45)",
  "rgba(255, 184, 77, 0.1)": "var(--reward-a10)",
  "rgba(255, 184, 77, 0.08)": "var(--reward-a08)",
  "rgba(155, 125, 255, 0.4)": "var(--accent-bright-a40)",
  "rgba(60, 80, 140, 0.35)": "var(--cold-blue-a35)",
  "rgba(255, 77, 109, 0.2)": "var(--danger-a20)",
  "rgba(120, 128, 154, 0.3)": "var(--muted-a30)",
  "rgba(168, 85, 247, 0.35)": "var(--corruption-a35)",
  "rgba(5, 7, 11, 0.65)": "var(--base-a65)",
  "rgba(5, 7, 11, 0.7)": "var(--base-a70)",
  "rgba(5, 7, 11, 0.75)": "var(--base-a75)",
  "rgba(122, 92, 255, 0.07)": "var(--accent-a07)",
  "rgba(122, 92, 255, 0.2)": "var(--accent-a20)",
  "rgba(122, 92, 255, 0.28)": "var(--accent-a28)",
  "rgba(155, 125, 255, 0.35)": "var(--accent-bright-a35)",
  "rgba(255, 77, 109, 0.3)": "var(--danger-a30)",
  "rgba(255, 77, 109, 0.45)": "var(--danger-a45)",
  "rgba(255, 140, 66, 0.35)": "var(--listening-a35)",
  "rgba(5, 7, 11, 0.15)": "var(--base-a15)",
  "rgba(5, 7, 11, 0.92)": "var(--base-a92)",
  "rgba(255, 77, 109, 0.12)": "var(--danger-a12)",
  "rgba(255, 77, 109, 0.08)": "var(--danger-a08)",
  "rgba(168, 85, 247, 0.15)": "var(--corruption-a15)",
  "rgba(168, 85, 247, 0.1)": "var(--corruption-a10)",
  "rgba(0, 0, 0, 0.12)": "var(--black-a12)",
  "rgba(255, 77, 109, 0.5)": "var(--danger-a50)",
  "rgba(124, 58, 237, 0.25)": "var(--accent-violet-a25)",
  "rgba(0, 0, 0, 0.92)": "var(--black-a92)",
  "rgba(18, 12, 32, 0.98)": "var(--ceremony-a98)",
  "rgba(8, 10, 22, 0.98)": "var(--ceremony-deep-a98)",
  "rgba(167, 139, 250, 0.35)": "var(--accent-lilac-a35)",
  "rgba(124, 58, 237, 0.35)": "var(--accent-violet-a35)",
  "rgba(250, 204, 21, 0)": "var(--reward-gold-a00)",
  "rgba(250, 204, 21, 0.35)": "var(--reward-gold-a35)",
  "rgba(167, 139, 250, 0.5)": "var(--accent-lilac-a50)",
  "rgba(250, 204, 21, 0.25)": "var(--reward-gold-a25)",
  "rgba(167, 139, 250, 0.2)": "var(--accent-lilac-a20)",
  "rgba(72, 120, 200, 0.08)": "var(--archive-blue-a08)",
  "rgba(255, 77, 109, 0.1)": "var(--danger-a10)",
  "rgba(124, 58, 237, 0.08)": "var(--accent-violet-a08)",
  "rgba(0, 0, 0, 0.94)": "var(--black-a94)",
  "rgba(167, 139, 250, 0.45)": "var(--accent-lilac-a45)",
  "rgba(124, 58, 237, 0.5)": "var(--accent-violet-a50)",
  "rgba(139, 92, 246, 0.12)": "var(--purple-a12)",
  "rgba(139, 92, 246, 0.08)": "var(--purple-a08)",
  "rgba(34, 211, 238, 0.06)": "var(--cyan-a06)",
  "rgba(88, 28, 135, 0.1)": "var(--archivist-a10)",
  "rgba(250, 204, 21, 0.04)": "var(--reward-gold-a04)",
  "rgba(255, 255, 255, 0.02)": "var(--white-a02)",
  "rgba(220, 38, 38, 0.15)": "var(--red-critical-a15)",
  "rgba(148, 163, 184, 0.06)": "var(--slate-a06)",
  "rgba(139, 92, 246, 0.06)": "var(--purple-a06)",
  "rgba(139, 92, 246, 0.15)": "var(--purple-a15)",
  "rgba(0, 0, 0, 0.25)": "var(--black-a25)",
  "rgba(139, 92, 246, 0.3)": "var(--purple-a30)",
  "rgba(220, 38, 38, 0.25)": "var(--red-critical-a25)",
  "rgba(220, 38, 38, 0.45)": "var(--red-critical-a45)",
  "rgba(220, 38, 38, 0.12)": "var(--red-critical-a12)",
  "rgba(139, 92, 246, 0.35)": "var(--purple-a35)",
  "rgba(255, 77, 109, 0.55)": "var(--danger-a55)",
  "rgba(255, 200, 80, 0.35)": "var(--shop-divine-glow)",
  "rgba(60, 40, 100, 0.45)": "var(--shop-shadow-glow)",
  "rgba(0, 0, 0, 0.45)": "var(--surface-2)",
  "rgba(122, 92, 255, 0.1)": "var(--accent-a10)",
  "rgba(255, 255, 255, 0.06)": "var(--white-a06)",
  "rgba(11, 16, 32, 0.72)": "var(--surface-a72)",
  "#05070b": "var(--background)",
  "#1a0f3a": "var(--theme-cyber-from)",
  "#12082a": "var(--theme-neon-from)",
  "#0a1228": "var(--theme-archive-from)",
  "#0d0518": "var(--theme-abyss-from)",
  "#101820": "var(--theme-station-from)",
  "#180828": "var(--theme-shrine-from)",
  "#a855f7": "var(--corruption)",
  "#b49aff": "var(--accent-cta-end)",
  "#ff8fa3": "var(--danger-soft)",
}

let css = readFileSync(file, "utf8")
const keys = Object.keys(MAP).sort((a, b) => b.length - a.length)
for (const literal of keys) {
  css = css.split(literal).join(MAP[literal])
}

const remaining = [...css.matchAll(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/g)].map((m) => m[0])
const unique = [...new Set(remaining)]
if (unique.length) {
  console.error("Unmapped colors remain:", unique)
  process.exit(1)
}

writeFileSync(file, css)
console.log("presentation.css: all colors mapped to theme variables")
