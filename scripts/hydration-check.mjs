/** Quick hydration diagnostic on :3001 */
import { chromium } from "playwright"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

const BASE = "http://localhost:3001"
const OUT = join(process.cwd(), "scripts", "audit-output", "3001-authenticated")

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local")
  const env = {}
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i < 1) continue
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    env[t.slice(0, i).trim()] = v
  }
  return env
}

async function injectFromStorage(page, env) {
  const state = JSON.parse(readFileSync(join(OUT, "storage-state.json"), "utf8"))
  await page.context().addCookies(state.cookies)
  await page.goto(BASE, { waitUntil: "domcontentloaded" })
}

async function main() {
  const env = loadEnvLocal()
  const browser = await chromium.launch({ headless: true })
  const page = await (await browser.newContext()).newPage()
  const network = []
  page.on("response", (r) => {
    const u = r.url()
    if (u.includes("supabase.co") && r.status() >= 400) network.push({ status: r.status(), url: u })
  })
  page.on("console", (m) => {
    if (m.type() === "error") console.log("ERR:", m.text().slice(0, 200))
  })

  if (existsSync(join(OUT, "storage-state.json"))) {
    await injectFromStorage(page, env)
  } else {
    console.log("no storage state")
    process.exit(1)
  }

  await page.goto(`${BASE}/home`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {})
  await page.waitForTimeout(15000)
  const text = await page.locator("body").innerText()
  console.log("URL:", page.url())
  console.log("Body snippet:", text.slice(0, 500))
  console.log("Network failures:", JSON.stringify(network.slice(0, 10), null, 2))
  await browser.close()
}

main()
