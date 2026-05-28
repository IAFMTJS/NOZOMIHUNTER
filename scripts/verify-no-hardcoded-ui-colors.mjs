#!/usr/bin/env node
/**
 * Fails if TS/TSX under src/ (except styles/) contains raw hex/rgba colors.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, extname } from "node:path"

const root = join(import.meta.dirname, "..", "src")
const allow = new Set(["src/styles/themeDefaults.ts"])

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const rel = p.replace(/\\/g, "/").slice(root.length - 3)
    if (statSync(p).isDirectory()) {
      if (rel.includes("/styles/")) continue
      walk(p, files)
    } else if ((extname(p) === ".tsx" || extname(p) === ".ts") && !allow.has(rel)) {
      files.push(p)
    }
  }
  return files
}

const hex = /#[0-9a-fA-F]{3,8}\b/g
const rgba = /rgba?\(\s*\d/g

let failed = false
for (const file of walk(root)) {
  const text = readFileSync(file, "utf8")
  const rel = file.replace(/\\/g, "/").split("/src/")[1]
  const hits = [
    ...(text.match(hex) ?? []),
    ...(text.match(rgba) ?? []),
  ]
  if (hits.length) {
    failed = true
    console.error(`${rel}: ${[...new Set(hits)].join(", ")}`)
  }
}

if (failed) {
  console.error("\nHardcoded UI colors found. Use CSS variables from src/styles/themes/.")
  process.exit(1)
}

console.log("No hardcoded hex/rgba in UI source files")
