#!/usr/bin/env node
/**
 * Route smoke matrix — GET core GDD routes (dev server required).
 * Usage: AUDIT_BASE=http://localhost:3000 node scripts/smoke-routes.mjs
 */
const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000"
const ROUTES = [
  "/",
  "/home",
  "/contracts",
  "/map",
  "/archive",
  "/leaderboard",
  "/profile",
  "/training",
  "/dungeons",
]

async function main() {
  let failed = 0
  for (const route of ROUTES) {
    const url = `${BASE}${route}`
    try {
      const res = await fetch(url, { redirect: "follow" })
      const ok = res.status < 500
      console.log(`${ok ? "OK" : "FAIL"} ${res.status} ${route}`)
      if (!ok) failed++
    } catch (e) {
      console.log(`FAIL ${route} — ${e.message}`)
      failed++
    }
  }
  if (failed) process.exit(1)
  console.log("[smoke-routes] All routes reachable")
}

main()
