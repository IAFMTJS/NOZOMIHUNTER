/**
 * Full user-journey E2E on localhost:3000 — training, contracts, dungeons.
 * Run: node scripts/e2e-user-journey.mjs
 * Env: BASE_URL (default http://localhost:3000), E2E_HEADED=1, E2E_STORAGE=path/to/state.json
 */
import { chromium } from "playwright"
import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000"
const HEADED = process.env.E2E_HEADED === "1"
const MAX_ENCOUNTER_STEPS = 40
const NAV_TIMEOUT = 120000
const REPORT_PATH = resolve(ROOT, "scripts", "e2e-report.json")

const ALL_DUNGEON_UNLOCKS = [
  "dungeon:neon-corridor",
  "dungeon:shadow-archive",
  "dungeon:abyss-core",
  "dungeon:corruption-run",
  "dungeon:void-pursuit",
  "dungeon:roguelike-sector",
]

const TRAINING_MODES = [
  "Signal Calibration",
  "Kana Dash",
  "Kanji Surgery",
  "Memory Cascade",
  "Shadow Echo",
  "Echo Listening",
  "Shadow Typing",
  "Memory Grid",
  "Survival Mode",
]

const DUNGEON_KEYS = [
  "dungeon:neon-corridor",
  "dungeon:shadow-archive",
  "dungeon:abyss-core",
  "dungeon:corruption-run",
  "dungeon:void-pursuit",
  "dungeon:roguelike-sector",
]

function loadEnvLocal() {
  const path = resolve(ROOT, ".env.local")
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i < 1) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}

function log(msg) {
  console.log(`[e2e] ${msg}`)
}

/** @typedef {{ name: string, status: 'pass'|'fail'|'skip'|'partial', notes: string[], durationMs: number, screenshots?: string[] }} TestResult */

/** @type {TestResult[]} */
const results = []
const screenshots = []

async function shot(page, name) {
  const dir = resolve(ROOT, "scripts", "e2e-screenshots")
  mkdirSync(dir, { recursive: true })
  const safe = name.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 80)
  const file = resolve(dir, `${Date.now()}-${safe}.png`)
  await page.screenshot({ path: file, fullPage: true })
  screenshots.push(file)
  return file
}

async function record(name, fn) {
  const start = Date.now()
  const entry = { name, status: "pass", notes: [], durationMs: 0, screenshots: [] }
  try {
    await fn(entry)
  } catch (e) {
    entry.status = "fail"
    entry.notes.push(e instanceof Error ? e.message : String(e))
  }
  entry.durationMs = Date.now() - start
  results.push(entry)
  log(`${entry.status.toUpperCase()} ${name} (${entry.durationMs}ms)`)
}

function parseEnv() {
  return loadEnvLocal()
}

async function tryCdpConnect() {
  for (const port of [9222, 9223, 9333]) {
    try {
      const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`)
      const contexts = browser.contexts()
      if (contexts.length === 0) return null
      const page =
        contexts[0].pages().find((p) => p.url().includes("localhost:3000")) ??
        contexts[0].pages()[0]
      if (!page) return null
      log(`Connected via CDP port ${port}`)
      return { browser, page, ownsBrowser: false }
    } catch {
      /* next port */
    }
  }
  return null
}

async function waitForHunterReady(page, entry) {
  const loading = page.getByText(/Loading hunter data|Signing in/i)
  await loading.waitFor({ state: "hidden", timeout: NAV_TIMEOUT }).catch(() => {})
  await page
    .getByText(/Stabilization drills|Select a sector|Grid Stalker|HUNTER POWER|Open contract/i)
    .first()
    .waitFor({ state: "visible", timeout: NAV_TIMEOUT })
    .catch(() => {})
  const stillLoading = await page.getByText(/Loading hunter data/i).isVisible().catch(() => false)
  if (stillLoading) {
    entry?.notes?.push("Hydration still loading after wait")
    throw new Error("Hunter data did not finish loading")
  }
}

async function boostTestPlayer(admin, userId) {
  const { error } = await admin.from("progression").update({
    level: 10,
    xp: 8000,
    rank: "B",
    stamina: 100,
    stamina_max: 100,
    unlocked_dungeons: ALL_DUNGEON_UNLOCKS,
    unlocked_systems: [
      "quests",
      "home",
      "dungeons",
      "training",
      "listening",
      "system:dungeons",
    ],
  }).eq("user_id", userId)
  if (error) log(`progression boost: ${error.message}`)
}

async function ensureAuth(context, page) {
  await page.goto(`${BASE_URL}/home`, { waitUntil: "load", timeout: NAV_TIMEOUT })
  await page.waitForTimeout(2000)

  if (!page.url().includes("/login")) {
    const loading = page.getByText(/Loading hunter data|Signing in/i)
    await loading.waitFor({ state: "hidden", timeout: 90000 }).catch(() => {})
    const homeMarker = page.getByRole("link", { name: /home/i }).or(page.locator("nav"))
    if (await page.getByText(/Stabilization drills|Hunter|Contracts|Missions/i).first().isVisible().catch(() => false)) {
      return "existing-session"
    }
    if (await homeMarker.first().isVisible().catch(() => false)) {
      return "existing-session"
    }
  }

  const env = parseEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon) throw new Error("Missing Supabase env in .env.local")

  const email = `e2e.${Date.now()}@nozomi-hunter.test`
  const password = `E2eTest_${Date.now().toString(36)}!`

  let createdUserId = null
  if (service) {
    const admin = createClient(url, service, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createErr) log(`admin.createUser: ${createErr.message}`)
    else if (created?.user?.id) {
      createdUserId = created.user.id
      await boostTestPlayer(admin, createdUserId)
    }
  }

  await page.goto(`${BASE_URL}/login`, { waitUntil: "load", timeout: NAV_TIMEOUT })
  const guestBtn = page.getByRole("button", { name: /Enter as Guest/i })
  if (await guestBtn.isVisible().catch(() => false)) {
    await guestBtn.click()
    await page.waitForURL(/\/home/, { timeout: 60000 })
    await page.waitForTimeout(2500)
    return "guest"
  }

  await page.getByRole("button", { name: "Sign up", exact: true }).click()
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Create account" }).click()
  await page.waitForTimeout(2000)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Sign in with email" }).click()
  await page.waitForURL(/\/home/, { timeout: 60000 })
  await page.waitForTimeout(3000)
  return `signup:${email}`
}

async function dismissOverlays(page) {
  page.on("dialog", (d) => d.accept())
  for (const label of [/Continue|Dismiss|Got it|Close|Claim|Acknowledge|Skip tutorial/i]) {
    const btn = page.getByRole("button", { name: label }).first()
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ timeout: 2000 }).catch(() => {})
      await page.waitForTimeout(400)
    }
  }
}

async function readPlayerSnapshot(page) {
  return page.evaluate(() => {
    const text = document.body.innerText
    const levelMatch = text.match(/Level\s*(\d+)/i) ?? text.match(/L\s*(\d+)\b/)
    const staminaMatch = text.match(/Stamina\s*(\d+)\s*\/\s*(\d+)/i)
    return {
      level: levelMatch ? Number(levelMatch[1]) : null,
      stamina: staminaMatch ? Number(staminaMatch[1]) : null,
      excerpt: text.slice(0, 500),
    }
  })
}

async function completeVocabLoop(page, entry, label) {
  let steps = 0
  while (steps < MAX_ENCOUNTER_STEPS) {
    steps++
    await dismissOverlays(page)

    const doneText = page.getByText(/All targets locked|contract complete|Drill complete|Sector cleared|Run complete|Extraction/i)
    if (await doneText.first().isVisible().catch(() => false)) {
      entry.notes.push(`${label}: completion UI seen at step ${steps}`)
      return true
    }

    const claimBtn = page.getByRole("button", { name: /Claim|Complete contract|Finish|Extract rewards/i }).first()
    if (await claimBtn.isVisible().catch(() => false)) {
      await claimBtn.click().catch(() => {})
      await page.waitForTimeout(800)
      continue
    }

    const transmit = page.getByTestId("encounter-transmit")
    const input = page.locator('input[type="text"]').first()

    if (await transmit.isVisible().catch(() => false)) {
      const whisper = page.getByRole("button", { name: /Companion whisper/i })
      if (await whisper.isEnabled().catch(() => false)) {
        await whisper.click().catch(() => {})
        await page.waitForTimeout(500)
      }
      const vision = page.getByRole("button", { name: /Hunter Vision/i })
      if (await vision.isVisible().catch(() => false)) {
        await vision.dispatchEvent("pointerdown").catch(() => {})
        await page.waitForTimeout(1200)
        await vision.dispatchEvent("pointerup").catch(() => {})
      }

      const bodyText = await page.locator(".nozomi-hint-target, [class*='LearnerWord']").first().innerText().catch(() => "")
      const whisperLine = await page.locator("text=/Companion whisper:/i").first().innerText().catch(() => "")

      let answer = ""
      const quoted = whisperLine.match(/"([^"]+)"/) ?? bodyText.match(/meaning[s]?:\s*([^\n]+)/i)
      if (quoted) answer = quoted[1]
      if (!answer) {
        const lines = bodyText.split("\n").map((s) => s.trim()).filter(Boolean)
        answer = lines[lines.length - 1] ?? "test"
      }

      await input.fill(answer.slice(0, 80))
      await transmit.click()
      await page.waitForTimeout(900)
      continue
    }

    const tile = page.locator("button").filter({ hasText: /[\u3040-\u9fff]/ }).first()
    if (await tile.isVisible().catch(() => false)) {
      await tile.click().catch(() => {})
      await page.waitForTimeout(500)
      continue
    }

    const generic = page.getByRole("button").filter({ hasNotText: /Abort|Abandon|Back|Whisper|Vision/i }).nth(2)
    if (await generic.isVisible().catch(() => false)) {
      await generic.click().catch(() => {})
      await page.waitForTimeout(500)
      continue
    }

    break
  }
  entry.notes.push(`${label}: stopped after ${steps} encounter steps`)
  return false
}

async function deployFromPrepare(page, entry) {
  await page.waitForURL(/\/prepare/, { timeout: 30000 }).catch(() => {})
  const cta = page.getByTestId("prepare-deploy")
  if (!(await cta.isVisible().catch(() => false))) {
    const blocked = await page.getByText(/Deployment locked|blocker/i).first().innerText().catch(() => "")
    entry.notes.push(`Deploy blocked: ${blocked || "CTA not visible"}`)
    return false
  }
  const disabled = await cta.isDisabled()
  if (disabled) {
    entry.notes.push("Deploy CTA disabled")
    return false
  }
  await cta.click()
  await page.waitForTimeout(2500)
  return true
}

async function advanceDungeonRun(page, entry) {
  let steps = 0
  while (steps < 60) {
    steps++
    await dismissOverlays(page)

    const abandonOnly = page.getByText(/Abort dungeon|Abandon active run/i)
    const clearCeremony = page.getByText(/Sector cleared|Dungeon clear|Run complete/i)
    if (await clearCeremony.first().isVisible().catch(() => false)) {
      entry.notes.push("Dungeon clear ceremony detected")
      await shot(page, "dungeon-clear")
      const btn = page.getByRole("button", { name: /Continue|Claim|Extract|Dismiss/i }).first()
      if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {})
      return true
    }

    const deploySector = page.getByRole("button", { name: /Deploy to sector/i })
    if (await deploySector.isVisible().catch(() => false)) {
      await deploySector.click()
      await page.waitForTimeout(1500)
      continue
    }

    const routeBtn = page.locator('[class*="route"], button').filter({ hasText: /Hall|Archive|Door|Route|Sector|Node/i }).first()
    if (await routeBtn.isVisible().catch(() => false)) {
      await routeBtn.click().catch(() => {})
      await page.waitForTimeout(1200)
      continue
    }

    const engage = page.getByRole("button", { name: /Engage|Enter sector|Breach|Continue transit/i }).first()
    if (await engage.isVisible().catch(() => false)) {
      await engage.click().catch(() => {})
      await page.waitForTimeout(1200)
      continue
    }

    const listenHold = page.getByRole("button", { name: /Hold to intercept|Listen|Scan/i }).first()
    if (await listenHold.isVisible().catch(() => false)) {
      await listenHold.dispatchEvent("pointerdown").catch(() => {})
      await page.waitForTimeout(2000)
      await listenHold.dispatchEvent("pointerup").catch(() => {})
      await page.waitForTimeout(800)
      continue
    }

    const advance = page.getByRole("button", { name: /Advance|Proceed|Continue|Next sector|Collect/i }).first()
    if (await advance.isVisible().catch(() => false)) {
      await advance.click().catch(() => {})
      await page.waitForTimeout(1000)
      continue
    }

    const vocabDone = await completeVocabLoop(page, entry, "dungeon-encounter")
    if (vocabDone) continue

    if (steps > 5 && (await abandonOnly.first().isVisible().catch(() => false))) {
      entry.notes.push(`Dungeon loop idle at step ${steps}`)
      break
    }
  }
  return false
}

async function runTrainingMode(page, modeLabel, entry) {
  await page.goto(`${BASE_URL}/training`, { waitUntil: "load", timeout: NAV_TIMEOUT })
  await waitForHunterReady(page, entry)
  await dismissOverlays(page)

  const modeKey = {
    "Signal Calibration": "signal-calibration",
    "Kana Dash": "kana-dash",
    "Kanji Surgery": "kanji-surgery",
    "Memory Cascade": "memory-cascade",
    "Shadow Echo": "shadow-echo",
    "Echo Listening": "echo-listening",
    "Shadow Typing": "shadow-typing",
    "Memory Grid": "memory-grid",
    "Survival Mode": "survival-vocab",
  }[modeLabel]
  const playBtn = modeKey
    ? page.getByTestId(`training-play-${modeKey}`)
    : page.locator("div").filter({ hasText: modeLabel }).getByRole("button", { name: /^Play$/i })
  if (!(await playBtn.isVisible().catch(() => false))) {
    const locked = page.locator("div").filter({ hasText: modeLabel }).getByText(/Requires L\d+/i)
    entry.status = "skip"
    entry.notes.push((await locked.first().innerText().catch(() => null)) ?? "Play button not found")
    return
  }
  await playBtn.click()
  await page.waitForURL(/\/contracts\//, { timeout: 20000 })
  const start = page.getByRole("button", { name: /Start drill/i }).first()
  if (await start.isVisible().catch(() => false)) await start.click()
  await page.waitForURL(/\/prepare/, { timeout: 20000 }).catch(() => {})
  const deployed = await deployFromPrepare(page, entry)
  if (!deployed) {
    entry.status = "partial"
    return
  }
  await page.waitForTimeout(2000)
  const ok = await completeVocabLoop(page, entry, modeLabel)
  if (!ok) entry.status = "partial"
  const completeBtn = page.getByRole("button", { name: /Complete|Finish drill|Claim/i }).first()
  if (await completeBtn.isVisible().catch(() => false)) {
    await completeBtn.click().catch(() => {})
    entry.notes.push("Clicked completion CTA")
  }
  await shot(page, `training-${modeLabel}`)
}

async function testContractsChannel(page, channel, entry) {
  await page.goto(`${BASE_URL}/contracts?tab=${channel}`, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(2000)
  await waitForHunterReady(page, entry)
  const links = page.getByTestId("contract-open")
  const count = await links.count()
  entry.notes.push(`${channel}: ${count} contracts visible`)
  if (count === 0) {
    entry.status = "skip"
    return
  }
  await links.first().click()
  await page.waitForTimeout(1500)
  const deploy = page.getByRole("button", { name: /Deploy contract|Track/i }).first()
  entry.notes.push(`Detail CTA: ${(await deploy.innerText().catch(() => "n/a"))}`)
  await shot(page, `contracts-${channel}`)
  await page.goBack().catch(() => {})
}

async function testDungeon(page, dungeonKey, entry) {
  const encoded = encodeURIComponent(dungeonKey)
  await page.goto(`${BASE_URL}/dungeons/${encoded}`, { waitUntil: "domcontentloaded" })
  await page.waitForTimeout(1500)

  const enter = page.getByTestId("dungeon-enter")
  await enter.scrollIntoViewIfNeeded().catch(() => {})
  if (!(await enter.isVisible().catch(() => false))) {
    entry.status = "skip"
    entry.notes.push("Enter dungeon CTA missing")
    return
  }
  if (await enter.isDisabled()) {
    const warn = await page.locator("text=/locked|requires|stamina|level|power/i").first().innerText().catch(() => "disabled")
    entry.status = "skip"
    entry.notes.push(`Cannot enter: ${warn}`)
    await shot(page, `dungeon-locked-${dungeonKey}`)
    return
  }

  await enter.click()
  await page.waitForURL(/\/prepare/, { timeout: 20000 })
  const deployed = await deployFromPrepare(page, entry)
  if (!deployed) {
    entry.status = "partial"
    return
  }
  await page.waitForURL(/\/dungeons/, { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(2000)

  const advanced = await advanceDungeonRun(page, entry)
  if (!advanced) entry.status = "partial"
  await shot(page, `dungeon-${dungeonKey.replace(/:/g, "-")}`)

  const abandon = page.getByRole("button", { name: /Abandon active run|Abort dungeon/i }).first()
  if (await abandon.isVisible().catch(() => false)) {
    await abandon.click().catch(() => {})
    await page.waitForTimeout(1000)
    page.on("dialog", (d) => d.accept())
    entry.notes.push("Abandoned run for cleanup")
  }
}

async function main() {
  log(`BASE_URL=${BASE_URL}`)
  const env = parseEnv()
  let browser
  let page
  let ownsBrowser = true
  let authMethod = "unknown"

  const storagePath = process.env.E2E_STORAGE
  const cdp = await tryCdpConnect()
  if (cdp) {
    browser = cdp.browser
    page = cdp.page
    ownsBrowser = false
    authMethod = "cdp-existing-browser"
  } else {
    browser = await chromium.launch({ headless: !HEADED, slowMo: HEADED ? 80 : 0 })
    const contextOptions = {}
    if (storagePath && existsSync(storagePath)) {
      contextOptions.storageState = storagePath
      authMethod = "storage-state"
    }
    const context = await browser.newContext(contextOptions)
    page = await context.newPage()
    page.setDefaultTimeout(NAV_TIMEOUT)
    authMethod = await ensureAuth(context, page)
  }

  page.setDefaultTimeout(NAV_TIMEOUT)
  page.on("dialog", (d) => d.accept())

  const player = await readPlayerSnapshot(page)
  log(`Auth: ${authMethod} | player snapshot: ${JSON.stringify(player)}`)

  await record("Session / home load", async (entry) => {
    await page.goto(`${BASE_URL}/home`, { waitUntil: "load", timeout: NAV_TIMEOUT })
    await waitForHunterReady(page, entry)
    await dismissOverlays(page)
    entry.notes.push(`URL: ${page.url()}`)
    entry.notes.push(`Player: ${JSON.stringify(await readPlayerSnapshot(page))}`)
    await shot(page, "home")
  })

  await record("Navigation shell", async (entry) => {
    for (const [path, label] of [
      ["/contracts", "Missions"],
      ["/dungeons", "Dungeons"],
      ["/training", "Training"],
      ["/vocabulary", "Vocabulary"],
      ["/profile", "Profile"],
    ]) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: "load", timeout: NAV_TIMEOUT })
      await waitForHunterReady(page, entry)
      await page.waitForTimeout(800)
      if (page.url().includes("/login")) throw new Error(`Redirected to login on ${path}`)
      entry.notes.push(`${label}: OK (${page.url()})`)
    }
  })

  for (const mode of TRAINING_MODES) {
    await record(`Training — ${mode}`, async (entry) => {
      await runTrainingMode(page, mode, entry)
    })
  }

  for (const ch of ["daily", "side", "story"]) {
    await record(`Contracts — ${ch} channel`, async (entry) => {
      await testContractsChannel(page, ch, entry)
    })
  }

  await record("Dungeons list", async (entry) => {
    await page.goto(`${BASE_URL}/dungeons`, { waitUntil: "load", timeout: NAV_TIMEOUT })
    await waitForHunterReady(page, entry)
    const names = await page.locator("a, button, h2, h3").allInnerTexts()
    const found = DUNGEON_KEYS.filter((k) =>
      names.some((t) => t.toLowerCase().includes(k.split(":")[1].replace(/-/g, " ")))
    )
    entry.notes.push(`Dungeon cards visible for: ${found.join(", ") || "none matched"}`)
    if (await page.getByRole("button", { name: /Abandon active run/i }).isVisible().catch(() => false)) {
      entry.notes.push("Active run present on list")
    }
    await shot(page, "dungeons-list")
  })

  for (const key of DUNGEON_KEYS) {
    const name = key.split(":")[1].replace(/-/g, " ")
    await record(`Dungeon — ${name}`, async (entry) => {
      await testDungeon(page, key, entry)
    })
  }

  if (ownsBrowser && browser) {
    try {
      const state = await page.context().storageState()
      const out = resolve(ROOT, "scripts", "e2e-storage.json")
      writeFileSync(out, JSON.stringify(state, null, 2))
      log(`Saved storage state to ${out}`)
    } catch {
      /* CDP context may not support */
    }
    await browser.close()
  }

  const summary = {
    ranAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    authMethod,
    player,
    results,
    screenshots,
    totals: {
      pass: results.filter((r) => r.status === "pass").length,
      fail: results.filter((r) => r.status === "fail").length,
      skip: results.filter((r) => r.status === "skip").length,
      partial: results.filter((r) => r.status === "partial").length,
    },
  }
  writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2))
  log(`Report written to ${REPORT_PATH}`)
  console.log(JSON.stringify(summary.totals, null, 2))
  process.exitCode = summary.totals.fail > 0 ? 1 : 0
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
