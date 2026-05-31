#!/usr/bin/env node
/**
 * Rename commission light PNGs → canonical *.light.webp paths, then convert.
 * Dark assets keep existing names (hero.home.command.webp, etc.).
 */
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

const ROOT = process.cwd()
const GAME = path.join(ROOT, "public/game-assets")
const ICONS = path.join(ROOT, "public/icons")

/** @type {Array<{ src: string; dest: string }>} */
const GAME_MAPPINGS = [
  { src: "heroes/home-command-light.png", dest: "heroes/hero.home.command.light.webp" },
  { src: "heroes/training-priority-light.png", dest: "heroes/hero.training.priority.light.webp" },
  { src: "heroes/dungeon-entry-light.png", dest: "heroes/hero.dungeon.entry.light.webp" },
  { src: "heroes/contract-file-light.png", dest: "heroes/hero.contract.file.light.webp" },
  { src: "heroes/world-map-light.png", dest: "heroes/hero.world.map.light.webp" },
  { src: "bosses/neon-warden-light.png", dest: "bosses/boss.neon-warden.light.webp" },
  { src: "bosses/shadow-archivist-light.png", dest: "bosses/boss.shadow-archivist.light.webp" },
  { src: "bosses/void-priest-light.png", dest: "bosses/boss.void-priest.light.webp" },
  {
    src: "seasons/fracture-week-banner-light.png",
    dest: "seasons/season.fracture-week.banner.light.webp",
  },
  { src: "npc/iris-portrait-light.png", dest: "npc/npc.iris.portrait.light.webp" },
  { src: "ui/system-crest-light.png", dest: "ui/crest.system.light.webp" },
  { src: "vfx/corruption-stage-1-light.png", dest: "vfx/corruption.stage.1.light.webp" },
  { src: "vfx/corruption-stage-2-light.png", dest: "vfx/corruption.stage.2.light.webp" },
  { src: "vfx/corruption-stage-3-light.png", dest: "vfx/corruption.stage.3.light.webp" },
  { src: "vfx/corruption-stage-4-light.png", dest: "vfx/corruption.stage.4.light.webp" },
  { src: "loading/panel-1-light.png", dest: "loading/loading.panel-1.light.webp" },
  { src: "loading/panel-2-light.png", dest: "loading/loading.panel-2.light.webp" },
  { src: "loading/panel-3-light.png", dest: "loading/loading.panel-3.light.webp" },
  { src: "loading/panel-4-light.png", dest: "loading/loading.panel-4.light.webp" },
  { src: "relics/focus-lens-light.png", dest: "relics/relic.focus-lens.light.webp" },
  { src: "relics/memory-core-light.png", dest: "relics/relic.memory-core.light.webp" },
  { src: "relics/void-seal-light.png", dest: "relics/relic.void-seal.light.webp" },
  { src: "relics/signal-cache-light.png", dest: "relics/relic.signal-cache.light.webp" },
  { src: "relics/shadow-shard-light.png", dest: "relics/relic.shadow-shard.light.webp" },
  { src: "relics/stamina-brew-light.png", dest: "relics/relic.stamina-brew.light.webp" },
  { src: "relics/corruption-ward-light.png", dest: "relics/relic.corruption-ward.light.webp" },
]

/** @type {Array<{ src: string; dest: string }>} */
const ICON_MAPPINGS = [
  { src: "app-icon-dark-version.png", dest: "app-icon-dark.webp" },
  { src: "app-icon-light-version.png", dest: "app-icon-light.webp" },
]

async function pngToWebp(pngPath, webpPath, quality = 85) {
  await sharp(pngPath).webp({ quality, effort: 4 }).toFile(webpPath)
  fs.unlinkSync(pngPath)
}

async function convertMappings(baseDir, mappings) {
  let ok = 0
  for (const { src, dest } of mappings) {
    const pngPath = path.join(baseDir, src)
    const webpPath = path.join(baseDir, dest)
    if (!fs.existsSync(pngPath)) {
      console.warn(`[normalize:light] skip missing: ${src}`)
      continue
    }
    fs.mkdirSync(path.dirname(webpPath), { recursive: true })
    await pngToWebp(pngPath, webpPath)
    const rel = path.relative(ROOT, webpPath)
    console.log(`[normalize:light] ${rel}`)
    ok++
  }
  return ok
}

async function main() {
  const game = await convertMappings(GAME, GAME_MAPPINGS)
  const icons = await convertMappings(ICONS, ICON_MAPPINGS)
  console.log(`[normalize:light] Done — ${game} game asset(s), ${icons} icon(s).`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
