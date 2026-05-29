#!/usr/bin/env node
/**
 * Batch-convert PNG → WebP under public/game-assets/ (keeps PNGs unless --replace).
 *
 * Usage:
 *   node scripts/convert-png-to-webp.mjs
 *   node scripts/convert-png-to-webp.mjs --quality 85
 *   node scripts/convert-png-to-webp.mjs --dir public/game-assets/heroes
 */
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

const ROOT = process.cwd()
const DEFAULT_DIR = path.join(ROOT, "public/game-assets")

function parseArgs() {
  const args = process.argv.slice(2)
  let dir = DEFAULT_DIR
  let quality = 85
  let replace = false
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dir" && args[i + 1]) {
      dir = path.isAbsolute(args[i + 1])
        ? args[i + 1]
        : path.join(ROOT, args[i + 1])
      i++
    } else if (args[i] === "--quality" && args[i + 1]) {
      quality = Math.min(100, Math.max(1, Number(args[i + 1])))
      i++
    } else if (args[i] === "--replace") {
      replace = true
    }
  }
  return { dir, quality, replace }
}

function walkPng(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walkPng(full, out)
    else if (name.toLowerCase().endsWith(".png")) out.push(full)
  }
  return out
}

async function main() {
  const { dir, quality, replace } = parseArgs()
  const files = walkPng(dir)
  if (files.length === 0) {
    console.log(`[convert:webp] No PNG files under ${path.relative(ROOT, dir)}`)
    return
  }

  let ok = 0
  for (const pngPath of files) {
    const webpPath = pngPath.replace(/\.png$/i, ".webp")
    await sharp(pngPath).webp({ quality, effort: 4 }).toFile(webpPath)
    const before = fs.statSync(pngPath).size
    const after = fs.statSync(webpPath).size
    const pct = ((1 - after / before) * 100).toFixed(0)
    console.log(
      `[convert:webp] ${path.relative(ROOT, webpPath)} (${pct}% smaller than PNG)`
    )
    if (replace) {
      fs.unlinkSync(pngPath)
    }
    ok++
  }
  console.log(`[convert:webp] Done — ${ok} file(s). Quality=${quality}`)
  if (!replace) {
    console.log("[convert:webp] PNG originals kept. Use --replace to delete them after convert.")
  }
  console.log("[convert:webp] Update content/seeds/asset-manifest.json paths to .webp, then npm run ingest:assets")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
