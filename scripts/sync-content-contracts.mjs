#!/usr/bin/env node
/** Sync Season 1 authored contracts into content/seeds/content-contracts.json */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const seedsPath = path.join(ROOT, "content/seeds/content-contracts.json")
const storyPath = path.join(
  ROOT,
  "content/seasons/season-01-broken-signal/story-missions.json"
)
const sidePath = path.join(
  ROOT,
  "content/seasons/season-01-broken-signal/side-missions.json"
)

const existing = JSON.parse(fs.readFileSync(seedsPath, "utf8"))
const story = JSON.parse(fs.readFileSync(storyPath, "utf8"))
const side = JSON.parse(fs.readFileSync(sidePath, "utf8"))

const kept = existing.filter(
  (c) =>
    c.channel !== "story" &&
    !(c.channel === "side" && String(c.id).startsWith("side-s01-"))
)

const storyContracts = story.missions.map((m) => ({
  id: m.id,
  title: m.title,
  channel: "story",
  template: m.template,
}))

const merged = [...kept, ...storyContracts, ...side.missions]
fs.writeFileSync(seedsPath, JSON.stringify(merged, null, 2))
console.log(
  `[sync-content-contracts] ${merged.length} contracts (${storyContracts.length} story, ${side.missions.length} side)`
)
