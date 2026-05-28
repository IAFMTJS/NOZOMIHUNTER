#!/usr/bin/env node
/** Replaces hardcoded white/black Tailwind overlays with theme variables. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs"
import { join, extname } from "node:path"

const root = join(import.meta.dirname, "..")
const src = join(root, "src")

/** @type {[string, string][]} */
const REPLACEMENTS = [
  ["hover:bg-white/5", "hover:bg-[var(--overlay-subtle)]"],
  ["hover:bg-white/10", "hover:bg-[var(--overlay-muted)]"],
  ["bg-white/15", "bg-[var(--overlay-toggle-off)]"],
  ["bg-white/8", "bg-[var(--overlay-muted)]"],
  ["bg-white/5", "bg-[var(--overlay-subtle)]"],
  ["bg-white/10", "bg-[var(--overlay-muted)]"],
  ["ring-white/10", "ring-[var(--ring-subtle)]"],
  ["border-white/10", "border-[var(--border-subtle)]"],
  ["border-white/6", "border-[var(--border-subtle)]"],
  ["bg-black/85", "bg-[var(--overlay-modal)]"],
  ["bg-black/75", "bg-[var(--overlay-backdrop)]"],
  ["bg-black/60", "bg-[var(--overlay-badge)]"],
  ["bg-black/55", "bg-[var(--overlay-backdrop-light)]"],
  ["bg-black/50", "bg-[var(--overlay-track)]"],
  ["bg-black/45", "bg-[var(--surface-2)]"],
  ["bg-black/40", "bg-[var(--overlay-panel)]"],
  ["bg-black/30", "bg-[var(--overlay-panel-strong)]"],
  ["bg-black/25", "bg-[var(--overlay-scrim)]"],
  ["bg-black/20", "bg-[var(--overlay-faint)]"],
]

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === "styles") continue
      walk(p, files)
    } else if (extname(p) === ".tsx" || extname(p) === ".ts") {
      files.push(p)
    }
  }
  return files
}

let total = 0
for (const file of walk(src)) {
  let text = readFileSync(file, "utf8")
  const before = text
  for (const [from, to] of REPLACEMENTS) {
    text = text.split(from).join(to)
  }
  if (text !== before) {
    writeFileSync(file, text)
    total++
  }
}

console.log(`Updated overlay classes in ${total} files`)
