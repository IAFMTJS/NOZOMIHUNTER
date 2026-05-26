/**
 * Temporary flow audit script — walks the app as a guest user and reports issues.
 */
import { chromium } from "playwright"

const BASE = "http://localhost:3000"
const issues = []
const consoleErrors = []
const failedRequests = []

function logIssue(severity, area, message, detail) {
  issues.push({ severity, area, message, detail })
}

async function waitForPage(page, timeout = 15000) {
  await page.waitForLoadState("domcontentloaded", { timeout })
  await page.waitForTimeout(800)
}

async function screenshot(page, name) {
  try {
    await page.screenshot({ path: `scripts/audit-${name}.png`, fullPage: true })
  } catch {
    /* ignore */
  }
}

async function checkPageHealth(page, area) {
  const bodyText = await page.locator("body").innerText().catch(() => "")
  if (/Application error|Internal Server Error|500|Unhandled Runtime Error/i.test(bodyText)) {
    logIssue("critical", area, "Runtime or server error visible on page", bodyText.slice(0, 300))
  }
  if (/Loading session\.\.\./i.test(bodyText) && bodyText.length < 200) {
    logIssue("medium", area, "Page stuck on loading state", bodyText.slice(0, 200))
  }
  const emptyMain = await page.locator("main").count()
  if (emptyMain === 0) {
    logIssue("low", area, "No <main> element found — possible layout/accessibility issue")
  }
}

async function clickNav(page, label) {
  const nav = page.locator("nav").last()
  const btn = nav.getByRole("link", { name: new RegExp(label, "i") })
  if ((await btn.count()) === 0) {
    logIssue("high", "navigation", `Bottom nav link "${label}" not found`)
    return false
  }
  await btn.click()
  await waitForPage(page)
  return true
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({ url: page.url(), text: msg.text() })
    }
  })
  page.on("pageerror", (err) => {
    consoleErrors.push({ url: page.url(), text: err.message })
  })
  page.on("requestfailed", (req) => {
    failedRequests.push({
      url: req.url(),
      failure: req.failure()?.errorText,
      page: page.url(),
    })
  })
  page.on("response", (res) => {
    if (res.status() >= 400 && !res.url().includes("_next")) {
      failedRequests.push({
        url: res.url(),
        status: res.status(),
        page: page.url(),
      })
    }
  })

  // 1. Landing
  try {
    const start = Date.now()
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 })
    const loadMs = Date.now() - start
    if (loadMs > 10000) {
      logIssue("medium", "landing", `Slow initial load: ${loadMs}ms`)
    }
    await waitForPage(page)
    await checkPageHealth(page, "landing (/)")
    await screenshot(page, "01-landing")

    const loginLink = page.getByRole("link", { name: /login|sign in|enter|boot/i })
    if ((await loginLink.count()) > 0) {
      await loginLink.first().click()
      await waitForPage(page)
    } else {
      await page.goto(`${BASE}/login`)
      await waitForPage(page)
    }
  } catch (e) {
    logIssue("critical", "landing", "Could not load landing page", String(e))
  }

  // 2. Login — guest
  try {
    await checkPageHealth(page, "login")
    await screenshot(page, "02-login")

    const guestBtn = page.getByRole("button", { name: /guest/i })
    if ((await guestBtn.count()) === 0) {
      const setupNotice = await page.locator("text=/Supabase|not configured/i").count()
      if (setupNotice > 0) {
        logIssue("critical", "login", "Supabase not configured — cannot proceed with auth flow")
      } else {
        logIssue("critical", "login", "Guest login button not found")
      }
    } else {
      await guestBtn.click()
      await page.waitForURL(/\/home/, { timeout: 30000 }).catch(() => {
        logIssue("high", "login", "Guest login did not redirect to /home", page.url())
      })
      await waitForPage(page)
    }
  } catch (e) {
    logIssue("critical", "login", "Login flow failed", String(e))
  }

  // 3. Home
  try {
    await checkPageHealth(page, "home")
    await screenshot(page, "03-home")
    const homeText = await page.locator("body").innerText()
    if (/error|failed|undefined|null/i.test(homeText) && /sync|load/i.test(homeText)) {
      logIssue("medium", "home", "Possible data load error on home screen", homeText.slice(0, 400))
    }
  } catch (e) {
    logIssue("high", "home", "Home page failed", String(e))
  }

  // 4. Bottom nav tabs
  const tabs = [
    { label: "Missions|Contracts", route: "/contracts" },
    { label: "Dungeons|Sectors", route: "/dungeons" },
    { label: "Vocabulary|Threat", route: "/vocabulary" },
    { label: "Profile|Hunter", route: "/profile" },
  ]

  for (const tab of tabs) {
    try {
      const clicked = await clickNav(page, tab.label)
      if (!clicked) continue
      if (!page.url().includes(tab.route.split("/")[1])) {
        logIssue("medium", "navigation", `Expected route containing ${tab.route}, got ${page.url()}`)
      }
      await checkPageHealth(page, tab.route)
      await screenshot(page, `04-${tab.route.replace(/\//g, "")}`)
    } catch (e) {
      logIssue("high", "navigation", `Tab ${tab.label} failed`, String(e))
    }
  }

  // 5. Contracts → first contract detail
  try {
    await page.goto(`${BASE}/contracts`, { waitUntil: "domcontentloaded" })
    await waitForPage(page)
    await checkPageHealth(page, "contracts")

    const contractLinks = page.locator('a[href*="/contracts/"]')
    const count = await contractLinks.count()
    if (count === 0) {
      logIssue("high", "contracts", "No contract cards/links found on contracts page")
    } else {
      await contractLinks.first().click()
      await waitForPage(page)
      await checkPageHealth(page, "contract detail")
      await screenshot(page, "05-contract-detail")

      const trackBtn = page.getByRole("button", { name: /track|accept|deploy|start/i })
      if ((await trackBtn.count()) === 0) {
        logIssue("medium", "contracts", "No Track/Start button on contract detail")
      } else {
        await trackBtn.first().click()
        await waitForPage(page)
        if (!page.url().includes("/prepare")) {
          logIssue("medium", "contracts", "Track did not navigate to /prepare", page.url())
        } else {
          await checkPageHealth(page, "prepare (quest)")
          await screenshot(page, "06-prepare")
        }
      }
    }
  } catch (e) {
    logIssue("high", "contracts", "Contract flow failed", String(e))
  }

  // 6. Dungeons flow
  try {
    await page.goto(`${BASE}/dungeons`, { waitUntil: "domcontentloaded" })
    await waitForPage(page)
    const dungeonLinks = page.locator('a[href*="/dungeons/"]')
    if ((await dungeonLinks.count()) === 0) {
      logIssue("high", "dungeons", "No dungeon entries found")
    } else {
      await dungeonLinks.first().click()
      await waitForPage(page)
      await checkPageHealth(page, "dungeon detail")
      await screenshot(page, "07-dungeon-detail")
    }
  } catch (e) {
    logIssue("high", "dungeons", "Dungeon flow failed", String(e))
  }

  // 7. Secondary routes
  const secondary = ["/settings", "/stats", "/achievements", "/inventory", "/training", "/records"]
  for (const route of secondary) {
    try {
      const start = Date.now()
      const res = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 })
      const ms = Date.now() - start
      if (ms > 15000) logIssue("medium", route, `Slow page load: ${ms}ms`)
      if (res && res.status() >= 400) {
        logIssue("high", route, `HTTP ${res.status()} on ${route}`)
      }
      await waitForPage(page)
      await checkPageHealth(page, route)
    } catch (e) {
      logIssue("high", route, `Secondary route failed`, String(e))
    }
  }

  // 8. Protected route without auth (new context)
  try {
    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    const res = await guestPage.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" })
    await guestPage.waitForTimeout(1000)
    const finalUrl = guestPage.url()
    if (!finalUrl.includes("/login")) {
      logIssue("high", "auth", "Unauthenticated user can access /home without redirect")
    }
    await guestContext.close()
  } catch (e) {
    logIssue("medium", "auth", "Auth guard test inconclusive", String(e))
  }

  // Summarize console / network
  const uniqueConsole = [...new Map(consoleErrors.map((e) => [e.text, e])).values()]
  for (const err of uniqueConsole.slice(0, 15)) {
    if (/favicon|hydration|devtools|extension/i.test(err.text)) continue
    logIssue("medium", "console", err.text.slice(0, 200), err.url)
  }

  const apiFails = failedRequests.filter(
    (r) =>
      !r.url.includes("favicon") &&
      !r.url.includes("_next") &&
      (r.status >= 400 || r.failure)
  )
  const uniqueApiFails = [...new Map(apiFails.map((r) => [r.url + (r.status ?? r.failure), r])).values()]
  for (const fail of uniqueApiFails.slice(0, 15)) {
    logIssue(
      fail.status === 401 || fail.status === 403 ? "medium" : "high",
      "network",
      `Failed request: ${fail.url}`,
      fail.status ? `HTTP ${fail.status}` : fail.failure
    )
  }

  await browser.close()

  console.log(JSON.stringify({ issues, consoleErrorCount: consoleErrors.length, failedRequestCount: failedRequests.length }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
