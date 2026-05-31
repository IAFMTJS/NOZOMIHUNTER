#!/usr/bin/env node
/**
 * Sends Web Push notifications via GitHub Actions (scheduled workflow).
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
 *
 * Invasion schedule mirrors src/systems/retention/languageInvasionSystem.ts
 */
import { createClient } from "@supabase/supabase-js"
import webpush from "web-push"

const INVASIONS = [
  {
    id: "invasion-kanji-bloom",
    headline: "Kanji bloom detected",
    detail: "Hostile glyph clusters appearing in routine sectors.",
    windowStart: 1,
    windowEnd: 7,
  },
  {
    id: "invasion-grammar-fracture",
    headline: "Grammar fracture wave",
    detail: "Sentence particles mutating across contract channels.",
    windowStart: 14,
    windowEnd: 21,
  },
  {
    id: "invasion-audio-ghost",
    headline: "Audio ghost invasion",
    detail: "Listening sectors carry phantom vocabulary overlays.",
    windowStart: 24,
    windowEnd: 28,
  },
]

function activeInvasion() {
  const day = new Date().getUTCDate()
  return INVASIONS.find((i) => day >= i.windowStart && day <= i.windowEnd) ?? null
}

function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env ${name}`)
  return v
}

async function main() {
  const dryRun = process.env.PUSH_DRY_RUN === "true"
  const force = process.env.PUSH_FORCE === "true"
  const invasion = activeInvasion()

  if (!invasion && !force) {
    console.log("[push:send] No active invasion window — skipping")
    return
  }

  const payload = invasion ?? INVASIONS[0]
  const href = `/home?anomaly=${encodeURIComponent(payload.id)}`
  const message = {
    title: "NOZOMI · Language invasion",
    body: `${payload.headline} — ${payload.detail}`,
    href,
    tag: payload.id,
  }

  if (dryRun) {
    console.log("[push:send] DRY RUN", message)
    return
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const publicKey = requireEnv("VAPID_PUBLIC_KEY")
  const privateKey = requireEnv("VAPID_PRIVATE_KEY")
  const subject = process.env.VAPID_SUBJECT ?? "mailto:ops@nozomi-hunter.app"

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)

  const supabase = createClient(url, serviceKey)
  const { data: rows, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, subscription")
    .eq("active", true)

  if (error) throw new Error(error.message)
  if (!rows?.length) {
    console.log("[push:send] No active subscriptions")
    return
  }

  let sent = 0
  let removed = 0
  let failed = 0

  for (const row of rows) {
    const sub = row.subscription
    if (!sub?.endpoint) continue
    try {
      await webpush.sendNotification(
        sub,
        JSON.stringify(message),
        { TTL: 60 * 60 * 6, urgency: "high" }
      )
      sent += 1
    } catch (err) {
      const status = err?.statusCode ?? err?.status
      if (status === 404 || status === 410) {
        await supabase.from("push_subscriptions").update({ active: false }).eq("id", row.id)
        removed += 1
      } else {
        failed += 1
        console.warn(`[push:send] failed ${row.endpoint?.slice(0, 48)}…`, status ?? err.message)
      }
    }
  }

  console.log(
    `[push:send] invasion=${payload.id} sent=${sent} deactivated=${removed} failed=${failed}`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
