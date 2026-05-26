/**
 * Full user-flow audit with screenshots and structured notes.
 */
import { chromium } from "playwright"
import { mkdirSync, writeFileSync } from "fs"
import { join } from "path"

const BASE = "http://localhost:3000"
const OUT = join(process.cwd(), "scripts", "audit-output")
mkdirSync(OUT, { recursive: true })

const notes = []
const consoleErrors = []
const networkIssues = []

function note(severity, step, title, detail = "") {
  notes.push({ severity, step, title, detail })
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

async function clickNav(page, label) {
  const link = page.locator("nav[aria-label='Hunter navigation']").getByRole("link", {
    name: new RegExp(`^${label}$`, "i"),
  })
  if ((await link.count()) === 0) {
    note("high", "nav", `Bottom nav tab "${label}" niet gevonden`)
    return false
  }
  await link.click()
  await waitStable(page, 1500)
  return true
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "nl-NL",
  })
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

  // ── 1. Landing ──────────────────────────────────────────────
  try {
    const t0 = Date.now()
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 90000 })
    const loadMs = Date.now() - t0
    await waitStable(page, 2000)
    await shot(page, "01-landing")
    const text = await bodyText(page)

    if (loadMs > 8000) note("medium", "landing", "Trage eerste load", `${loadMs}ms`)
    if (!/Initialize hunter/i.test(text)) note("high", "landing", "CTA 'Initialize hunter' ontbreekt")
    if (!/NOZOMI HUNTER SYSTEM/i.test(text)) note("medium", "landing", "Boot-terminal tekst ontbreekt of laadt niet")
  } catch (e) {
    note("critical", "landing", "Landing page laadt niet", String(e))
  }

  // ── 2. Naar login ───────────────────────────────────────────
  try {
    await page.getByRole("link", { name: /Initialize hunter/i }).click()
    await waitStable(page)
    await shot(page, "02-login")
    const text = await bodyText(page)
    if (!/Sign in to access/i.test(text)) note("medium", "login", "Login subtitel ontbreekt")
    if (!/Enter as Guest/i.test(text)) note("high", "login", "Guest-knop ontbreekt")
  } catch (e) {
    note("critical", "login", "Navigatie naar login mislukt", String(e))
  }

  // ── 3. Guest login ──────────────────────────────────────────
  let authenticated = false
  try {
    await page.getByRole("button", { name: /Enter as Guest/i }).click()
    await page.waitForTimeout(2500)
    await shot(page, "03-after-guest-click")
    const text = await bodyText(page)
    const url = page.url()

    if (url.includes("/home")) {
      authenticated = true
      note("info", "login", "Guest login gelukt")
    } else {
      const errMatch = text.match(/Anonymous sign-ins are disabled|Guest sign-in failed|error/i)
      note(
        "critical",
        "login",
        "Guest login werkt niet — flow stopt hier",
        errMatch ? text.match(/Anonymous sign-ins are disabled[^\n]*/i)?.[0] ?? text.slice(0, 300) : url
      )
    }
  } catch (e) {
    note("critical", "login", "Guest login crashte", String(e))
  }

  // ── 4. Probeer signup als fallback ──────────────────────────
  if (!authenticated) {
    try {
      const testEmail = `nozomi-audit-${Date.now()}@mailinator.test`
      const testPass = "auditTest123!"
      await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" })
      await page.getByRole("button", { name: /^Sign up$/i }).click()
      await page.getByLabel("Email").fill(testEmail)
      await page.getByLabel("Password").fill(testPass)
      await page.getByRole("button", { name: /Create account/i }).click()
      await page.waitForTimeout(3000)
      await shot(page, "04-after-signup")
      const text = await bodyText(page)

      if (/check your inbox|confirmation/i.test(text)) {
        note("high", "login", "Signup vereist e-mailbevestiging — geen directe toegang", testEmail)
      } else if (page.url().includes("/home")) {
        authenticated = true
        note("info", "login", "Signup + auto-login gelukt")
      } else {
        // Probeer direct inloggen
        await page.getByRole("button", { name: /^Sign in$/i }).click()
        await page.getByLabel("Email").fill(testEmail)
        await page.getByLabel("Password").fill(testPass)
        await page.getByRole("button", { name: /Sign in with email/i }).click()
        await page.waitForTimeout(3000)
        await shot(page, "05-after-email-signin")
        if (page.url().includes("/home")) {
          authenticated = true
          note("info", "login", "Email signup + signin gelukt")
        } else {
          note("high", "login", "Email login na signup mislukt", text.slice(0, 400))
        }
      }
    } catch (e) {
      note("medium", "login", "Signup fallback mislukt", String(e))
    }
  }

  // ── 5. Beschermde routes zonder auth ────────────────────────
  if (!authenticated) {
    const protectedRoutes = ["/home", "/contracts", "/dungeons", "/vocabulary", "/profile", "/prepare"]
    for (const route of protectedRoutes) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 })
      await waitStable(page)
      const url = page.url()
      const text = await bodyText(page)
      if (!url.includes("/login") && !url.includes(route)) {
        note("high", "auth", `${route} redirect onverwacht`, url)
      }
      if (url.includes("/login") && /Loading session/i.test(text)) {
        note("medium", "auth", `${route} → login toont 'Loading session...'`, "Mogelijk verwarrende UX")
      }
    }
    await shot(page, "06-login-blocked-state")
  }

  // ── 6. Authenticated flow ───────────────────────────────────
  if (authenticated) {
    await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" })
    await waitStable(page, 2000)
    await shot(page, "07-home")
    {
      const text = await bodyText(page)
      if (/Loading hunter status/i.test(text)) note("high", "home", "Home blijft hangen op laden")
      if (!/Level|Rank|XP/i.test(text)) note("medium", "home", "Geen player stats zichtbaar op home")
    }

    for (const tab of ["Home", "Missions", "Dungeons", "Vocab", "Profile"]) {
      await clickNav(page, tab)
      await shot(page, `08-nav-${tab.toLowerCase()}`)
      const text = await bodyText(page)
      if (/Loading/i.test(text) && text.length < 120) {
        note("medium", "nav", `Tab ${tab} blijft op loading`, text.slice(0, 150))
      }
      if (/error|failed|undefined/i.test(text)) {
        note("high", "nav", `Fouttekst op ${tab}`, text.slice(0, 200))
      }
    }

    // Contracts flow
    await page.goto(`${BASE}/contracts`, { waitUntil: "domcontentloaded" })
    await waitStable(page, 2000)
    await shot(page, "09-contracts")
    const contractLinks = page.locator('a[href*="/contracts/"]')
    const cc = await contractLinks.count()
    if (cc === 0) note("high", "contracts", "Geen contracten/missies zichtbaar")
    else {
      await contractLinks.first().click()
      await waitStable(page)
      await shot(page, "10-contract-detail")
      const track = page.getByRole("button", { name: /track|accept|deploy|start/i })
      if ((await track.count()) === 0) note("medium", "contracts", "Geen Track/Deploy knop op contract detail")
      else {
        await track.first().click()
        await waitStable(page)
        await shot(page, "11-prepare")
        if (!page.url().includes("/prepare")) note("medium", "contracts", "Track navigeert niet naar /prepare", page.url())
      }
    }

    // Dungeons
    await page.goto(`${BASE}/dungeons`, { waitUntil: "domcontentloaded" })
    await waitStable(page, 2000)
    await shot(page, "12-dungeons")
    const dungeonLinks = page.locator('a[href*="/dungeons/"]')
    if ((await dungeonLinks.count()) === 0) note("high", "dungeons", "Geen dungeons zichtbaar")
    else {
      await dungeonLinks.first().click()
      await waitStable(page)
      await shot(page, "13-dungeon-detail")
    }

    // Secondary pages
    for (const route of ["/settings", "/stats", "/achievements", "/inventory", "/training", "/records", "/system"]) {
      const t0 = Date.now()
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 })
      const ms = Date.now() - t0
      await waitStable(page)
      const slug = route.replace(/\//g, "") || "root"
      await shot(page, `14-${slug}`)
      const text = await bodyText(page)
      if (ms > 12000) note("medium", route, "Trage pagina-load", `${ms}ms`)
      if (/Loading/i.test(text) && text.length < 150) note("medium", route, "Pagina blijft op loading", text.slice(0, 150))
    }

    // Profile → settings link
    await page.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded" })
    await waitStable(page)
    const settingsLink = page.getByRole("link", { name: /settings/i })
    if ((await settingsLink.count()) === 0) note("low", "profile", "Geen Settings-link op profile")
  }

  // ── Console / network samenvatting ────────────────────────────
  const uniqueConsole = [...new Map(consoleErrors.map((e) => [e.text, e])).values()]
  for (const e of uniqueConsole.slice(0, 10)) {
    if (/favicon|hydration|devtools|Download the React DevTools/i.test(e.text)) continue
    note("medium", "console", e.text.slice(0, 180), e.url)
  }

  const uniqueNet = [...new Map(networkIssues.map((n) => [`${n.url}:${n.status}`, n])).values()]
  for (const n of uniqueNet.slice(0, 10)) {
    note(n.status >= 500 ? "high" : "medium", "network", `HTTP ${n.status}: ${n.url}`, n.page)
  }

  await browser.close()

  const report = {
    timestamp: new Date().toISOString(),
    authenticated,
    screenshotsDir: OUT,
    issueCount: notes.length,
    notes,
  }
  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
