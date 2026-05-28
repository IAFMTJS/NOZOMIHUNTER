/**
 * Full UX audit for localhost:3001 — works with or without auth.
 */
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "fs"
import { join } from "path"

const BASE = process.env.AUDIT_BASE ?? "http://localhost:3001"
const OUT = join(process.cwd(), "scripts", "audit-output", "3001-full")
mkdirSync(OUT, { recursive: true })

const notes = []
const consoleErrors = []
const networkIssues = []
const timings = []

function note(severity, area, title, detail = "") {
  notes.push({ severity, area, title, detail })
}

async function shot(page, name) {
  const path = join(OUT, `${name}.png`)
  await page.screenshot({ path, fullPage: true })
  return path
}

async function bodyText(page) {
  return page.locator("body").innerText().catch(() => "")
}

async function waitStable(page, ms = 1200) {
  await page.waitForLoadState("domcontentloaded")
  await page.waitForTimeout(ms)
}

async function timed(page, label, fn) {
  const t0 = Date.now()
  await fn()
  timings.push({ label, ms: Date.now() - t0 })
}

async function clickNav(page, label) {
  const link = page.locator("nav[aria-label='Hunter navigation']").getByRole("link", {
    name: new RegExp(`^${label}$`, "i"),
  })
  if ((await link.count()) === 0) return false
  await link.click()
  await waitStable(page, 1500)
  return true
}

async function checkHealth(page, area) {
  const text = await bodyText(page)
  if (/Application error|Internal Server Error|Unhandled Runtime Error/i.test(text)) {
    note("critical", area, "Runtime/server error zichtbaar", text.slice(0, 300))
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "nl-NL" })
  const page = await ctx.newPage()

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push({ url: page.url(), text: msg.text() })
  })
  page.on("pageerror", (err) => consoleErrors.push({ url: page.url(), text: err.message }))
  page.on("response", (res) => {
    const url = res.url()
    if (res.status() >= 400 && !url.includes("_next") && !url.includes("favicon")) {
      networkIssues.push({ page: page.url(), url, status: res.status() })
    }
  })

  let authenticated = false

  // ── Landing ──
  await timed(page, "landing", async () => {
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 90000 })
    await waitStable(page, 2000)
  })
  await shot(page, "01-landing")
  await checkHealth(page, "landing")
  {
    const text = await bodyText(page)
    if (!/Initialize hunter/i.test(text)) note("high", "landing", "CTA 'Initialize hunter' ontbreekt")
    if (!/NOZOMI HUNTER SYSTEM/i.test(text)) note("medium", "landing", "Boot-terminal branding ontbreekt")
    const t = timings.find((x) => x.label === "landing")
    if (t && t.ms > 10000) note("medium", "landing", "Trage eerste load", `${t.ms}ms`)
  }

  // ── Login page ──
  await page.getByRole("link", { name: /Initialize hunter/i }).click()
  await waitStable(page)
  await shot(page, "02-login")
  await checkHealth(page, "login")
  {
    const text = await bodyText(page)
    const hasGuest = /Enter as Guest/i.test(text)
    const hasGoogle = /Continue with Google/i.test(text)
    const hasEmail = /Sign in with email|Create account/i.test(text)
    if (!/Sign in to access/i.test(text)) note("low", "login", "Subtitel 'Sign in to access…' ontbreekt")
    if (!hasGoogle) note("medium", "login", "Google OAuth-knop ontbreekt")
    if (!hasEmail) note("medium", "login", "Email auth-velden ontbreken")
    note("info", "login", hasGuest ? "Guest-knop zichtbaar" : "Guest-knop verborgen (NEXT_PUBLIC_ENABLE_GUEST_AUTH?)")
  }

  // Login mode tabs
  for (const mode of ["Sign up", "Magic link"]) {
    const btn = page.getByRole("button", { name: new RegExp(`^${mode}$`, "i") })
    if ((await btn.count()) > 0) {
      await btn.click()
      await waitStable(page, 600)
      await shot(page, `02-login-${mode.toLowerCase().replace(/\s/g, "-")}`)
    }
  }
  await page.getByRole("button", { name: /^Sign in$/i }).click()
  await waitStable(page, 400)

  // ── Guest login ──
  const guestBtn = page.getByRole("button", { name: /Enter as Guest/i })
  if ((await guestBtn.count()) > 0) {
    await guestBtn.click()
    await page.waitForTimeout(3500)
    await shot(page, "03-after-guest")
    if (page.url().includes("/home")) {
      authenticated = true
      note("info", "auth", "Guest login gelukt → /home")
    } else {
      const text = await bodyText(page)
      note(
        "critical",
        "auth",
        "Guest login mislukt",
        text.match(/Anonymous sign-ins are disabled|Guest sign-in failed|error[^\n]*/i)?.[0] ?? page.url()
      )
    }
  }

  // ── Protected routes (unauthenticated) ──
  if (!authenticated) {
    const fresh = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const p2 = await fresh.newPage()
    for (const route of ["/home", "/contracts", "/dungeons", "/vocabulary", "/profile", "/prepare", "/settings", "/training", "/records", "/inventory", "/stats", "/achievements", "/system"]) {
      await p2.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 })
      await waitStable(p2, 1000)
      const url = p2.url()
      const text = await p2.locator("body").innerText().catch(() => "")
      if (!url.includes("/login")) {
        note("critical", "auth", `${route} niet naar login geredirect`, url)
      } else if (/Signing in|Loading session|Loading hunter/i.test(text)) {
        note("medium", "auth", `${route} → login: verwarrende loading-tekst`, text.match(/Signing in|Loading[^\n]*/i)?.[0] ?? "")
      }
    }
    await shot(p2, "04-auth-guard-login")
    await fresh.close()
  }

  // ── Authenticated journey ──
  if (authenticated) {
    await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" })
    await waitStable(page, 2000)
    await shot(page, "05-home")
    {
      const text = await bodyText(page)
      if (/Loading hunter data/i.test(text)) note("high", "home", "Blijft hangen op hunter data laden")
      if (!/Level|Rank|XP|Stamina/i.test(text)) note("medium", "home", "Geen hunter stats zichtbaar")
    }

    for (const tab of ["Home", "Missions", "Dungeons", "Vocab", "Profile"]) {
      if (await clickNav(page, tab)) {
        await shot(page, `06-nav-${tab.toLowerCase()}`)
        await checkHealth(page, `nav-${tab}`)
        const text = await bodyText(page)
        if (text.length < 80 && /Loading/i.test(text)) note("medium", `nav-${tab}`, "Tab lijkt leeg/loading")
      } else {
        note("high", "nav", `Bottom nav tab '${tab}' niet gevonden`)
      }
    }

    await page.goto(`${BASE}/contracts`, { waitUntil: "domcontentloaded" })
    await waitStable(page, 2000)
    await shot(page, "07-contracts")
    const links = page.locator('a[href*="/contracts/"]')
    const cc = await links.count()
    if (cc === 0) note("high", "contracts", "Geen contracten in catalogus")
    else {
      await links.first().click()
      await waitStable(page)
      await shot(page, "08-contract-detail")
      const cta = page.getByRole("button", { name: /track|accept|deploy|start|view/i })
      const ctaLink = page.getByRole("link", { name: /deploy|prepare|track/i })
      if ((await cta.count()) + (await ctaLink.count()) === 0) {
        note("medium", "contracts", "Geen actie-CTA op contract detail (mogelijk read-only/completed)")
      } else {
        const btn = (await cta.count()) > 0 ? cta.first() : ctaLink.first()
        await btn.click()
        await waitStable(page)
        await shot(page, "09-after-contract-cta")
        if (!page.url().includes("/prepare") && !page.url().includes("/contracts")) {
          note("medium", "contracts", "CTA navigeert niet naar prepare", page.url())
        }
      }
    }

    await page.goto(`${BASE}/dungeons`, { waitUntil: "domcontentloaded" })
    await waitStable(page, 2000)
    await shot(page, "10-dungeons")
    const dLinks = page.locator('a[href*="/dungeons/"]')
    if ((await dLinks.count()) === 0) note("high", "dungeons", "Geen dungeons in lijst")
    else {
      await dLinks.first().click()
      await waitStable(page)
      await shot(page, "11-dungeon-detail")
      const enter = page.getByRole("button", { name: /enter|deploy|start|breach/i })
      if ((await enter.count()) === 0) note("low", "dungeons", "Geen Enter/Deploy knop op dungeon detail")
    }

    await page.goto(`${BASE}/vocabulary`, { waitUntil: "domcontentloaded" })
    await waitStable(page, 1500)
    await shot(page, "12-vocabulary")
    const wordLinks = page.locator('a[href*="/vocabulary/"]')
    if ((await wordLinks.count()) > 0) {
      await wordLinks.first().click()
      await waitStable(page)
      await shot(page, "13-vocabulary-detail")
    }

    for (const route of ["/training", "/settings", "/stats", "/achievements", "/inventory", "/records", "/system"]) {
      const t0 = Date.now()
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 })
      const ms = Date.now() - t0
      await waitStable(page)
      await shot(page, `14-${route.replace(/\//g, "")}`)
      await checkHealth(page, route)
      if (ms > 12000) note("medium", route, "Trage paginaload", `${ms}ms`)
    }

    await page.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded" })
    await waitStable(page)
    if ((await page.getByRole("link", { name: /settings/i }).count()) === 0) {
      note("low", "profile", "Geen Settings-link op profile")
    }
  }

  // Console / network
  for (const e of [...new Map(consoleErrors.map((x) => [x.text, x])).values()].slice(0, 12)) {
    if (/favicon|hydration|devtools|React DevTools/i.test(e.text)) continue
    note("medium", "console", e.text.slice(0, 200), e.url)
  }
  for (const n of [...new Map(networkIssues.map((x) => [`${x.url}:${x.status}`, x])).values()].slice(0, 12)) {
    note(n.status >= 500 ? "high" : "medium", "network", `HTTP ${n.status}`, n.url)
  }

  await browser.close()

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    authenticated,
    timings,
    issueCount: notes.length,
    notes,
    screenshotsDir: OUT,
  }
  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
