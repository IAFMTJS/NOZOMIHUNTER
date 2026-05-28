#!/usr/bin/env node
/**
 * Ensures dark.css and light.css define the same CSS custom property keys.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dirname, "..")
const extract = (file) =>
  [...readFileSync(join(root, file), "utf8").matchAll(/^\s*(--[a-zA-Z0-9-]+):/gm)].map(
    (m) => m[1]
  )

const dark = new Set(extract("src/styles/themes/dark.css"))
const light = new Set(extract("src/styles/themes/light.css"))
const onlyDark = [...dark].filter((k) => !light.has(k)).sort()
const onlyLight = [...light].filter((k) => !dark.has(k)).sort()

if (onlyDark.length || onlyLight.length) {
  console.error("Theme token parity FAILED")
  if (onlyDark.length) console.error("  Only in dark.css:", onlyDark.join(", "))
  if (onlyLight.length) console.error("  Only in light.css:", onlyLight.join(", "))
  process.exit(1)
}

console.log(`Theme token parity OK (${dark.size} keys in dark.css and light.css)`)
