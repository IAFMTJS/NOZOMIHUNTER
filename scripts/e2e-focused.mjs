/**
 * Focused smoke: 1 training drill, 1 daily contract request, 1 dungeon entry+deploy.
 * Uses scripts/e2e-storage.json if present.
 */
import { chromium } from "playwright"
import { existsSync, readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const STORAGE = resolve(ROOT, "scripts", "e2e-storage.json")
const T = 120000

async function ready(page) {
  await page.getByText(/Loading hunter data|Signing in/i).first().waitFor({ state: "hidden", timeout: T }).catch(() => {})
  await page.waitForTimeout(1500)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext(
    existsSync(STORAGE) ? { storageState: STORAGE } : {}
  )
  const page = await ctx.newPage()
  page.setDefaultTimeout(T)
  page.on("dialog", (d) => d.accept())

  const log = []
  const go = async (label, fn) => {
    try {
      const note = await fn()
      log.push({ label, ok: true, note })
      console.log(`OK ${label}: ${note}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      log.push({ label, ok: false, note: msg })
      console.log(`FAIL ${label}: ${msg}`)
    }
  }

  await go("home", async () => {
    await page.goto(`${BASE}/home`, { waitUntil: "load", timeout: T })
    await ready(page)
    return page.url()
  })

  await go("training kana dash", async () => {
    await page.goto(`${BASE}/training`, { waitUntil: "load", timeout: T })
    await ready(page)
    const play = page.getByTestId("training-play-kana-dash")
    if (await play.isDisabled()) return "kana dash locked/disabled"
    await play.click()
    const reachedContract = await page
      .waitForURL(/\/contracts\//, { timeout: 15000, waitUntil: "commit" })
      .then(() => true)
      .catch(() => false)
    if (!reachedContract) return `play did not navigate (${page.url()})`
    await page.getByRole("button", { name: /Start drill/i }).click()
    await page.waitForURL(/\/prepare/, { timeout: T, waitUntil: "commit" })
    await page.getByTestId("prepare-deploy").click()
    await page.waitForTimeout(3000)
    const hasEncounter = await page.getByRole("button", { name: "Transmit" }).isVisible().catch(() => false)
    return hasEncounter ? "encounter overlay up" : `post-deploy url ${page.url()}`
  })

  await go("daily contract request", async () => {
    await page.goto(`${BASE}/contracts?tab=daily`, { waitUntil: "load", timeout: T })
    await ready(page)
    const req = page.getByTestId("contracts-request")
    if (await req.isVisible().catch(() => false)) {
      await req.click()
      await page.waitForTimeout(4000)
    }
    const n = await page.getByTestId("contract-open").count()
    return `${n} contracts after request`
  })

  await go("abandon stuck dungeon", async () => {
    await page.goto(`${BASE}/dungeons`, { waitUntil: "load", timeout: T })
    await ready(page)
    const abandon = page.getByTestId("dungeon-abandon")
    if (await abandon.isVisible().catch(() => false)) {
      await abandon.click()
      await page.waitForTimeout(2000)
      return "abandoned"
    }
    return "none active"
  })

  await go("neon corridor enter", async () => {
    const key = encodeURIComponent("dungeon:neon-corridor")
    await page.goto(`${BASE}/dungeons/${key}`, { waitUntil: "load", timeout: T })
    await ready(page)
    const enter = page.getByTestId("dungeon-enter")
    await enter.scrollIntoViewIfNeeded()
    if (await enter.isDisabled()) return "dungeon enter disabled (gate/stamina/active run)"
    await enter.click({ timeout: 15000 })
    await page.waitForURL(/\/prepare/, { timeout: T, waitUntil: "commit" })
    await page.getByTestId("prepare-deploy").click()
    await page.waitForTimeout(4000)
    const deploy = await page.getByRole("button", { name: /Deploy to sector/i }).isVisible().catch(() => false)
    return deploy ? "dungeon deployed in sector overlay" : `url ${page.url()}`
  })

  console.log(JSON.stringify(log, null, 2))
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
