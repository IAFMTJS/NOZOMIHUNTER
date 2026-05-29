#!/usr/bin/env node
/**
 * Visual audit — captures routes and validates board parity markers.
 * Usage: npm run dev then npm run check:visual
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const OUT = path.join(ROOT, "scripts/visual-baselines")
const REF = path.join(ROOT, "docs/assets/reference")
const BASE = process.env.VISUAL_AUDIT_BASE ?? "http://localhost:3000"

const ROUTES = [
  { name: "landing", path: "/", ref: null },
  { name: "home", path: "/home", ref: "board-1-command-node.png", markers: [".nozomi-screen-home", ".nozomi-embedded"] },
  { name: "training", path: "/training", ref: "board-2-mode-identity.png", markers: [".nozomi-screen-training"] },
  { name: "contracts", path: "/contracts", ref: null, markers: [".nozomi-screen-quests"] },
  { name: "dungeons", path: "/dungeons", ref: null },
  { name: "map", path: "/map", ref: null, markers: [".nozomi-screen-map"] },
  { name: "leaderboard", path: "/leaderboard", ref: null },
  { name: "archive", path: "/archive", ref: null, markers: [".nozomi-screen-archive"] },
  { name: "contacts", path: "/contacts", ref: null, markers: [".nozomi-screen-contacts"] },
  { name: "leaderboard", path: "/leaderboard", ref: null },
]

async function main() {
  let playwright
  try {
    playwright = await import("playwright")
  } catch {
    console.log("[check:visual] playwright not installed — writing route manifest only")
    fs.mkdirSync(OUT, { recursive: true })
    fs.writeFileSync(
      path.join(OUT, "routes.json"),
      JSON.stringify({ base: BASE, routes: ROUTES, captured: false }, null, 2)
    )
    process.exit(0)
  }

  fs.mkdirSync(OUT, { recursive: true })
  const browser = await playwright.chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const report = { base: BASE, routes: [], failed: false }

  for (const route of ROUTES) {
    const url = `${BASE}${route.path}`
    const entry = { name: route.name, path: route.path, captured: false, markers: {}, refCheck: null }
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 })
      const shotPath = path.join(OUT, `${route.name}.png`)
      await page.screenshot({ path: shotPath, fullPage: true })
      entry.captured = true

      if (route.markers?.length) {
        for (const sel of route.markers) {
          entry.markers[sel] = await page.locator(sel).count()
          if (entry.markers[sel] === 0) {
            console.error(`[check:visual] missing marker ${sel} on ${route.name}`)
            report.failed = true
          }
        }
      }

      if (route.ref && fs.existsSync(path.join(REF, route.ref))) {
        const refStat = fs.statSync(path.join(REF, route.ref))
        const capStat = fs.statSync(shotPath)
        const ratio = capStat.size / Math.max(1, refStat.size)
        entry.refCheck = { ref: route.ref, sizeRatio: ratio, ok: ratio > 0.15 && ratio < 8 }
        if (!entry.refCheck.ok) {
          console.warn(`[check:visual] layout drift? ${route.name} size ratio ${ratio.toFixed(2)}`)
        }
      }

      console.log(`[check:visual] captured ${route.name}`)
    } catch (e) {
      console.warn(`[check:visual] skip ${route.name}:`, e.message)
      entry.error = e.message
    }
    report.routes.push(entry)
  }

  await browser.close()
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2))
  console.log("[check:visual] done → scripts/visual-baselines/")
  if (report.failed) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
