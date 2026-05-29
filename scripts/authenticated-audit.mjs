/**
 * Authenticated full-app audit — logs in via Supabase admin magic link, then walks all flows.
 * Usage: node scripts/authenticated-audit.mjs
 * Env: AUDIT_BASE (default http://localhost:3001), optional AUDIT_EMAIL
 */
import { chromium } from "playwright"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

const BASE = process.env.AUDIT_BASE ?? "http://localhost:3001"
const OUT = join(process.cwd(), "scripts", "audit-output", "3001-authenticated")
mkdirSync(OUT, { recursive: true })

const notes = []
const consoleErrors = []
const networkIssues = []
const routeResults = []

function note(severity, area, title, detail = "") {
  notes.push({ severity, area, title, detail })
}

function routeLog(path, status, detail = "") {
  routeResults.push({ path, status, detail })
}

async function shot(page, name) {
  const path = join(OUT, `${name}.png`)
  await page.screenshot({ path, fullPage: true })
  return path
}

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local")
  if (!existsSync(path)) return {}
  const env = {}
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i < 1) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    env[k] = v
  }
  return env
}

async function bodyText(page) {
  return page.locator("body").innerText().catch(() => "")
}

async function waitStable(page, ms = 1500) {
  await page.waitForLoadState("domcontentloaded")
  await page.waitForTimeout(ms)
}

async function waitForHunterReady(page, timeoutMs = 60000) {
  await page
    .waitForFunction(
      () => {
        const t = document.body?.innerText ?? ""
        if (/Application error|Internal Server Error|Unhandled Runtime Error/i.test(t)) return true
        return (
          t.length > 180 &&
          !/Loading hunter data/i.test(t) &&
          !/^Signing in/i.test(t.trim())
        )
      },
      { timeout: timeoutMs }
    )
    .catch(() => {})
  await page.waitForTimeout(1200)
}

async function checkHealth(page, area) {
  const text = await bodyText(page)
  if (/Application error|Internal Server Error|Unhandled Runtime Error/i.test(text)) {
    note("critical", area, "Runtime/server error op pagina", text.slice(0, 280))
    return false
  }
  return true
}

async function clickNav(page, label) {
  const link = page.locator("nav[aria-label='Hunter navigation']").getByRole("link", {
    name: new RegExp(`^${label}$`, "i"),
  })
  if ((await link.count()) === 0) return false
  await link.click({ force: true })
  await waitStable(page, 1800)
  return true
}

async function gotoRoute(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 45000 })
  await waitForHunterReady(page, 45000)
}

async function injectSession(page, env, session) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const cookiesToSet = []

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookiesToSet.map(({ name, value }) => ({ name, value }))
      },
      setAll(cookies) {
        for (const c of cookies) {
          const idx = cookiesToSet.findIndex((x) => x.name === c.name)
          if (idx >= 0) cookiesToSet[idx] = c
          else cookiesToSet.push(c)
        }
      },
    },
  })

  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })
  if (error) throw new Error(`setSession: ${error.message}`)

  const host = new URL(BASE).hostname
  const normalizeSameSite = (v) => {
    if (!v) return "Lax"
    const s = String(v).toLowerCase()
    if (s === "strict") return "Strict"
    if (s === "none") return "None"
    return "Lax"
  }
  await page.context().addCookies(
    cookiesToSet.map(({ name, value, options }) => ({
      name,
      value,
      domain: host,
      path: options?.path ?? "/",
      httpOnly: options?.httpOnly ?? false,
      secure: options?.secure ?? false,
      sameSite: normalizeSameSite(options?.sameSite),
    }))
  )

  await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" })
  await waitForHunterReady(page)
}

async function establishSession(page, env) {
  const storagePath = join(OUT, "storage-state.json")
  if (existsSync(storagePath)) {
    const state = JSON.parse(readFileSync(storagePath, "utf8"))
    await page.context().addCookies(state.cookies ?? [])
    if (state.origins?.[0]?.localStorage) {
      await page.goto(BASE, { waitUntil: "domcontentloaded" })
      for (const { name, value } of state.origins[0].localStorage) {
        await page.evaluate(([n, v]) => localStorage.setItem(n, v), [name, value])
      }
    }
    await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" })
    await waitStable(page, 2500)
    const text = await bodyText(page)
    if (!page.url().includes("/login") && !/Sign in to access/i.test(text)) {
      return { ok: true, method: "cached-storage" }
    }
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) {
    return { ok: false, error: "Missing Supabase keys in .env.local" }
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const anon = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let email = process.env.AUDIT_EMAIL?.trim()
  if (!email) {
    const { data: users, error } = await admin.auth.admin.listUsers({ perPage: 5 })
    if (error) return { ok: false, error: `listUsers: ${error.message}` }
    email = users?.users?.find((u) => u.email)?.email
    if (!email) return { ok: false, error: "No email user — set AUDIT_EMAIL" }
    note("info", "auth", "Audit sessie voor user", email.replace(/(.{2}).+(@.+)/, "$1***$2"))
  }

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  })
  if (linkErr) return { ok: false, error: linkErr.message }

  const tokenHash = linkData?.properties?.hashed_token
  if (!tokenHash) return { ok: false, error: "No hashed_token from generateLink" }

  const { data: verified, error: verifyErr } = await anon.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  })
  if (verifyErr || !verified?.session) {
    return { ok: false, error: verifyErr?.message ?? "verifyOtp returned no session" }
  }

  await injectSession(page, env, verified.session)

  const text = await bodyText(page)
  if (page.url().includes("/login") || /Sign in to access/i.test(text)) {
    return { ok: false, error: `Session inject failed — still on login: ${page.url()}` }
  }

  await page.context().storageState({ path: storagePath })
  return { ok: true, method: "otp-inject", email }
}

async function main() {
  const env = loadEnvLocal()
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "nl-NL" })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    const style = document.createElement("style")
    style.textContent = "nextjs-portal { display: none !important; pointer-events: none !important; }"
    document.documentElement.appendChild(style)
  })

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push({ url: page.url(), text: msg.text() })
  })
  page.on("pageerror", (err) => consoleErrors.push({ url: page.url(), text: err.message }))
  page.on("response", (res) => {
    const u = res.url()
    if (res.status() >= 400 && !u.includes("_next") && !u.includes("favicon")) {
      networkIssues.push({ page: page.url(), url: u, status: res.status() })
    }
  })

  let authenticated = false
  try {
  const auth = await establishSession(page, env)
  if (!auth.ok) {
    note("critical", "auth", "Kon geen sessie opzetten", auth.error)
  } else {
    authenticated = true
    note("info", "auth", "Ingelogd via audit", auth.method)
    await shot(page, "01-home-authenticated")
  }

  if (!authenticated) {
    return
  }

  // ── Home ──
  await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" })
  await waitForHunterReady(page)
  await checkHealth(page, "home")
  await shot(page, "02-home")
  {
    const text = await bodyText(page)
    if (/Loading hunter data|Signing in/i.test(text)) note("high", "home", "Home blijft laden")
    if (!/Level|Rank|XP|Stamina|Corruption/i.test(text)) note("medium", "home", "Hunter stats niet zichtbaar")
    else routeLog("/home", "ok", "Stats zichtbaar")
  }

  // ── Bottom nav ──
  const navTabs = [
    { label: "Home", expect: "/home" },
    { label: "Missions", expect: "/contracts" },
    { label: "Dungeons", expect: "/dungeons" },
    { label: "Vocab", expect: "/vocabulary" },
    { label: "Profile", expect: "/profile" },
  ]
  for (const tab of navTabs) {
    await gotoRoute(page, tab.expect)
    await shot(page, `03-nav-${tab.label.toLowerCase()}`)
    const url = page.url()
    if (!url.includes(tab.expect.replace(/^\//, ""))) {
      note("medium", "nav", `${tab.label} verwacht ${tab.expect}`, url)
      routeLog(tab.expect, "warn", url)
    } else {
      await checkHealth(page, tab.label)
      routeLog(tab.expect, "ok")
    }
    const text = await bodyText(page)
    if (text.length < 100 && /Loading hunter data|Signing in/i.test(text)) {
      note("medium", tab.label, "Weinig content / loading state")
    }
  }

  // ── Contracts ──
  await page.goto(`${BASE}/contracts`, { waitUntil: "domcontentloaded" })
  await waitForHunterReady(page)
  await shot(page, "04-contracts")
  await checkHealth(page, "contracts")
  {
    const tabs = page.getByRole("button", { name: /story|daily|side|training/i })
    if ((await tabs.count()) > 0) {
      await tabs.first().click()
      await waitStable(page, 800)
    }
    const links = page.locator('a[href*="/contracts/"]')
    const n = await links.count()
    if (n === 0) {
      note("high", "contracts", "Geen contract links in catalogus")
      routeLog("/contracts", "fail", "empty catalog")
    } else {
      routeLog("/contracts", "ok", `${n} contracts`)
      await links.first().click()
      await waitStable(page)
      await shot(page, "05-contract-detail")
      const text = await bodyText(page)
      const deploy = page.getByRole("button", { name: /deploy|track|accept|start drill|enter sector/i })
      const deployLink = page.getByRole("link", { name: /deploy|prepare/i })
      if (/completed|read-only|cleared/i.test(text) && (await deploy.count()) === 0) {
        routeLog("/contracts/[id]", "ok", "read-only/completed")
        note("info", "contracts", "Eerste contract is read-only (completed)")
      } else if ((await deploy.count()) + (await deployLink.count()) === 0) {
        note("medium", "contracts", "Geen deploy/track CTA op detail")
        routeLog("/contracts/[id]", "warn", "no CTA")
      } else {
        const el = (await deploy.count()) > 0 ? deploy.first() : deployLink.first()
        await el.click({ force: true })
        await waitStable(page)
        await shot(page, "06-prepare-or-action")
        if (page.url().includes("/prepare")) {
          routeLog("/prepare", "ok", "via contract CTA")
          const prepText = await bodyText(page)
          if (/CRITICAL|unstable|readiness/i.test(prepText)) note("info", "prepare", "Readiness waarschuwing zichtbaar")
          const deployBtn = page.getByRole("button", { name: /deploy|enter|start/i })
          if ((await deployBtn.count()) > 0) {
            note("info", "prepare", "Deploy-knop aanwezig (niet geklikt — voorkomt run start)")
          }
        } else {
          routeLog("/prepare", "warn", page.url())
        }
      }
    }
  }

  // ── Dungeons ──
  await page.goto(`${BASE}/dungeons`, { waitUntil: "domcontentloaded" })
  await waitForHunterReady(page)
  await shot(page, "07-dungeons")
  {
    const abandon = page.getByRole("button", { name: /abandon active run/i })
    if ((await abandon.count()) > 0) {
      note("info", "dungeons", "Actieve run — abandon banner zichtbaar")
      note("medium", "dungeons", "Actieve dungeon-overlay kan hub-klikken blokkeren", "Neon Warden / Corridor run overlay")
    }
    const dLinks = page.locator('a[href*="/dungeons/"]')
    const dn = await dLinks.count()
    if (dn === 0) {
      note("high", "dungeons", "Geen dungeon entries")
      routeLog("/dungeons", "fail")
    } else {
      routeLog("/dungeons", "ok", `${dn} dungeons`)
      try {
        await dLinks.first().click({ force: true, timeout: 8000 })
      } catch {
        const href = await dLinks.first().getAttribute("href")
        if (href) await gotoRoute(page, href)
      }
      await waitStable(page)
      await shot(page, "08-dungeon-detail")
      routeLog("/dungeons/[key]", "ok")
    }
    const failureCeremony = page.getByTestId("dungeon-failure-ceremony")
    if ((await failureCeremony.count()) > 0) {
      await shot(page, "08b-dungeon-failure-ceremony")
      routeLog("/run/FAILURE", "ok", "failure ceremony overlay visible")
      note("info", "dungeons", "Dungeon failure ceremony actief — E2E selector OK")
    } else {
      routeLog("/run/FAILURE", "skip", "no active FAILURE run")
    }
  }

  // ── Vocabulary ──
  await page.goto(`${BASE}/vocabulary`, { waitUntil: "domcontentloaded" })
  await waitForHunterReady(page)
  await shot(page, "09-vocabulary")
  {
    const wLinks = page.locator('a[href*="/vocabulary/"]')
    if ((await wLinks.count()) > 0) {
      await wLinks.first().click()
      await waitStable(page)
      await shot(page, "10-vocabulary-detail")
      routeLog("/vocabulary/[id]", "ok")
    } else routeLog("/vocabulary", "warn", "geen woorden")
  }

  await page.goto(`${BASE}/leaderboard`, { waitUntil: "domcontentloaded" })
  await waitForHunterReady(page)
  await shot(page, "10-leaderboard")
  {
    const text = await bodyText(page)
    if (/weekly/i.test(text) && /lifetime/i.test(text)) {
      routeLog("/leaderboard", "ok", "weekly + lifetime tabs")
    } else {
      note("medium", "leaderboard", "Leaderboard tabs niet gevonden")
      routeLog("/leaderboard", "warn", "tabs missing")
    }
  }

  await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" })
  await waitForHunterReady(page)
  const loadingOverlay = page.locator("[data-testid='loading-screen-overlay']")
  if ((await loadingOverlay.count()) > 0) {
    routeLog("/home/loading-overlay", "ok", "marker present")
  } else {
    routeLog("/home/loading-overlay", "skip", "not visible after load")
  }

  // ── Secondary routes ──
  for (const route of [
    "/map",
    "/archive",
    "/contacts",
    "/training",
    "/settings",
    "/stats",
    "/achievements",
    "/inventory",
    "/records",
    "/system",
  ]) {
    const t0 = Date.now()
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 })
      const ms = Date.now() - t0
      await waitForHunterReady(page, 45000)
      await shot(page, `11-${route.replace(/\//g, "")}`)
      const ok = await checkHealth(page, route)
      const text = await bodyText(page)
      if (page.url().includes("/login")) {
        note("high", route, "Uitgelogd / redirect naar login")
        routeLog(route, "fail", "auth lost")
      } else if (/Loading hunter data|Signing in/i.test(text) && text.length < 200) {
        note("medium", route, "Blijft op loading")
        routeLog(route, "warn", "loading")
      } else {
        routeLog(route, ok ? "ok" : "fail", `${ms}ms`)
      }
      if (ms > 12000) note("medium", route, "Trage load", `${ms}ms`)
    } catch (e) {
      note("high", route, "Route crashte", String(e))
      routeLog(route, "fail", String(e))
    }
  }

  // ── Profile → settings ──
  await page.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded" })
  await waitStable(page)
  const settingsLink = page.getByRole("link", { name: /settings/i })
  if ((await settingsLink.count()) === 0) note("low", "profile", "Geen Settings-link")
  else {
    await settingsLink.first().click({ force: true })
    await waitStable(page)
    await shot(page, "12-profile-settings-link")
    routeLog("/profile→settings", page.url().includes("settings") ? "ok" : "warn", page.url())
  }

  // Console / network digest
  for (const e of [...new Map(consoleErrors.map((x) => [x.text, x])).values()].slice(0, 15)) {
    if (/favicon|hydration|devtools|React DevTools|Download the React/i.test(e.text)) continue
    note("medium", "console", e.text.slice(0, 180), e.url)
  }
  for (const n of [...new Map(networkIssues.map((x) => [`${x.url}:${x.status}`, x])).values()].slice(0, 15)) {
    if (n.url.includes("supabase.co/rest") && n.status === 406) continue
    note(n.status >= 500 ? "high" : "medium", "network", `HTTP ${n.status}`, n.url)
  }

  await browser.close()
  } catch (e) {
    note("high", "audit", "Onverwachte audit-fout", String(e))
  } finally {
    await browser.close().catch(() => {})
    writeReport(authenticated)
  }

  function writeReport(authOk) {
    const critical = notes.filter((n) => n.severity === "critical")
    const high = notes.filter((n) => n.severity === "high")
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE,
      authenticated: authOk,
      routeResults,
      issueCount: notes.length,
      summary: { critical: critical.length, high: high.length, total: notes.length },
      notes,
      screenshotsDir: OUT,
    }
    writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2))
    console.log(JSON.stringify(report, null, 2))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
