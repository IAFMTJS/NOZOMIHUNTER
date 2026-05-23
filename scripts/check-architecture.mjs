import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const componentsDir = path.join(root, "src", "components")

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walk(full, files)
    else if (/\.(tsx|ts)$/.test(name)) files.push(full)
  }
  return files
}

const forbidden = "@/services/supabase"
let failed = false

for (const file of walk(componentsDir)) {
  const text = fs.readFileSync(file, "utf8")
  if (text.includes(forbidden)) {
    console.error(`Architecture violation: ${path.relative(root, file)} imports ${forbidden}`)
    failed = true
  }
}

if (failed) process.exit(1)
console.log("check-architecture: ok (no Supabase imports in src/components)")
