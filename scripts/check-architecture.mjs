import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walk(full, files)
    else if (/\.(tsx|ts|mjs|js)$/.test(name)) files.push(full)
  }
  return files
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/")
}

let failed = false
const warnings = []

function fail(msg) {
  console.error(msg)
  failed = true
}

function warn(msg) {
  warnings.push(msg)
}

const allSrc = walk(path.join(root, "src"))

for (const file of allSrc) {
  const text = fs.readFileSync(file, "utf8")
  const r = rel(file)

  if (r.startsWith("src/components/") && text.includes("@/services/supabase")) {
    fail(`Architecture violation: ${r} imports @/services/supabase`)
  }

  if (r.startsWith("src/systems/") && text.includes("@/features/")) {
    fail(`Architecture violation: ${r} imports @/features/`)
  }

  if (r.includes("/components/") && r.startsWith("src/features/")) {
  if (
    /from\s+["']@\/features\/[^"']+\/services\/[^"']*Lifecycle["']/.test(text)
  ) {
    fail(
      `Architecture violation: ${r} imports a lifecycle module (use *Actions instead)`
    )
  }
  }
}

for (const file of allSrc) {
  const r = rel(file)
  if (!r.startsWith("src/systems/economy/") || !r.endsWith(".ts")) continue
  const lines = fs.readFileSync(file, "utf8").split("\n").length
  if (lines > 250) {
    warn(`Economy file exceeds 250 lines: ${r} (${lines} lines)`)
  }
}

if (warnings.length > 0) {
  for (const w of warnings) console.warn(`Warning: ${w}`)
}

if (failed) process.exit(1)
console.log("check-architecture: ok")
