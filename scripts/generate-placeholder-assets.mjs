#!/usr/bin/env node
/**
 * Production-quality placeholder SVGs (Vol 9 MVP slice).
 * Board-inspired gradients, grid depth, silhouettes — not flat text cards.
 * Replace with commissioned WebP/AVIF via ingest:assets when ready.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()

function heroArt({ label, subtitle, accent, mood = "command" }) {
  const grid =
    mood === "command"
      ? `<g opacity="0.12" stroke="${accent}" stroke-width="0.5">
  <line x1="0" y1="90" x2="640" y2="90"/><line x1="0" y1="180" x2="640" y2="180"/>
  <line x1="0" y1="270" x2="640" y2="270"/><line x1="160" y1="0" x2="160" y2="360"/>
  <line x1="320" y1="0" x2="320" y2="360"/><line x1="480" y1="0" x2="480" y2="360"/>
</g>`
      : mood === "training"
        ? `<g opacity="0.2"><rect x="40" y="220" width="120" height="8" rx="2" fill="${accent}"/>
  <rect x="40" y="240" width="200" height="8" rx="2" fill="${accent}" opacity="0.6"/>
  <rect x="40" y="260" width="160" height="8" rx="2" fill="${accent}" opacity="0.4"/></g>`
        : `<ellipse cx="480" cy="200" rx="90" ry="120" fill="${accent}" opacity="0.15"/>
  <ellipse cx="480" cy="200" rx="60" ry="90" fill="none" stroke="${accent}" stroke-width="2" opacity="0.4"/>`

  const silhouette =
    mood === "dungeon"
      ? `<path d="M420 320 L520 120 L580 320 Z" fill="${accent}" opacity="0.25"/>
  <rect x="460" y="140" width="80" height="100" rx="4" fill="#05070b" opacity="0.5"/>`
      : mood === "portrait"
        ? `<circle cx="520" cy="160" r="70" fill="${accent}" opacity="0.2"/>
  <circle cx="520" cy="150" r="45" fill="#0b1020" stroke="${accent}" stroke-width="2" opacity="0.6"/>`
        : `<rect x="380" y="80" width="200" height="240" rx="8" fill="${accent}" opacity="0.08" stroke="${accent}" stroke-width="1" opacity-stroke="0.3"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#030508"/>
      <stop offset="45%" stop-color="#0a0f1a"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.45"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="640" height="360" fill="url(#bg)"/>
  <rect width="640" height="360" fill="url(#glow)"/>
  ${grid}
  ${silhouette}
  <rect x="0" y="280" width="640" height="80" fill="#030508" opacity="0.85"/>
  <text x="32" y="40" fill="${accent}" font-family="system-ui,sans-serif" font-size="11" letter-spacing="5" opacity="0.9">NOZOMI REGISTRY</text>
  <text x="32" y="200" fill="#f0eef8" font-family="system-ui,sans-serif" font-size="32" font-weight="700">${label}</text>
  <text x="32" y="232" fill="#9a96a8" font-family="system-ui,sans-serif" font-size="13" letter-spacing="1">${subtitle}</text>
  <text x="32" y="330" fill="${accent}" font-family="system-ui,sans-serif" font-size="10" letter-spacing="3" opacity="0.7">SECTOR ART — PLACEHOLDER</text>
</svg>`
}

function bossArt(name, accent, glyph) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img">
  <defs>
    <linearGradient id="b" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#05070b"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.5"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#b)"/>
  <g opacity="0.15" stroke="${accent}" fill="none">
    <polygon points="320,40 580,320 60,320"/>
  </g>
  <text x="320" y="180" text-anchor="middle" fill="${accent}" font-size="120" font-family="serif" opacity="0.35">${glyph}</text>
  <rect x="0" y="0" width="640" height="360" fill="none" stroke="${accent}" stroke-width="2" opacity="0.25"/>
  <text x="32" y="48" fill="#9b7dff" font-size="11" letter-spacing="4" font-family="system-ui">WARDEN FRAME</text>
  <text x="32" y="300" fill="#f0eef8" font-size="28" font-weight="600" font-family="system-ui">${name}</text>
</svg>`
}

function relicArt(label, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img">
  <rect width="128" height="128" rx="16" fill="#0a0f1a"/>
  <circle cx="64" cy="64" r="40" fill="none" stroke="${accent}" stroke-width="2" opacity="0.6"/>
  <circle cx="64" cy="64" r="24" fill="${accent}" opacity="0.2"/>
  <text x="64" y="110" text-anchor="middle" fill="#c8c4d8" font-size="9" font-family="system-ui">${label}</text>
</svg>`
}

function loadingArt(title, accent) {
  return heroArt({
    label: title,
    subtitle: "Synchronizing archive telemetry…",
    accent,
    mood: "command",
  })
}

const files = {
  "public/game-assets/heroes/home-command.svg": heroArt({
    label: "Command Node",
    subtitle: "Active objective · sector corruption · ops feed",
    accent: "#7a5cff",
    mood: "command",
  }),
  "public/game-assets/heroes/training-priority.svg": heroArt({
    label: "Training Priority",
    subtitle: "Discipline lane · arcade pressure · today's focus",
    accent: "#5cff9b",
    mood: "training",
  }),
  "public/game-assets/heroes/dungeon-entry.svg": heroArt({
    label: "Sector Breach",
    subtitle: "Boss silhouette · modifier badges · corruption meter",
    accent: "#ff5c7a",
    mood: "dungeon",
  }),
  "public/game-assets/heroes/contract-file.svg": heroArt({
    label: "Contract File",
    subtitle: "Risk gauge · progress rails · claim extraction",
    accent: "#ffb84d",
    mood: "command",
  }),
  "public/game-assets/heroes/world-map.svg": heroArt({
    label: "Sector Map",
    subtitle: "Illustrated nodes · selection glow · hidden sectors",
    accent: "#4dc4ff",
    mood: "command",
  }),
  "public/game-assets/bosses/neon-warden.svg": bossArt("Neon Warden", "#7a5cff", "守"),
  "public/game-assets/bosses/shadow-archivist.svg": bossArt("Shadow Archivist", "#4a3d6b", "影"),
  "public/game-assets/bosses/void-priest.svg": bossArt("Void Priest", "#9b2dff", "虚"),
  "public/game-assets/seasons/fracture-week-banner.svg": heroArt({
    label: "Fracture Week",
    subtitle: "Season modifier · sector events · prestige track",
    accent: "#ff6b4a",
    mood: "command",
  }),
  "public/game-assets/npc/iris-portrait.svg": heroArt({
    label: "Iris",
    subtitle: "Spectral routing · trust warnings",
    accent: "#b07cff",
    mood: "portrait",
  }),
  "public/game-assets/ui/system-crest.svg": relicArt("Registry", "#7a5cff"),
  "public/game-assets/vfx/corruption-stage-1.svg": loadingArt("Corruption I", "#6a7a9a"),
  "public/game-assets/vfx/corruption-stage-2.svg": loadingArt("Corruption II", "#8a6a9a"),
  "public/game-assets/vfx/corruption-stage-3.svg": loadingArt("Corruption III", "#c45c5c"),
  "public/game-assets/vfx/corruption-stage-4.svg": loadingArt("Corruption IV", "#ff3d5c"),
  "public/game-assets/loading/panel-1.svg": loadingArt("Archive Fragment", "#7a5cff"),
  "public/game-assets/loading/panel-2.svg": loadingArt("Sector Telemetry", "#5cff9b"),
  "public/game-assets/loading/panel-3.svg": loadingArt("Warden Trace", "#ff5c7a"),
  "public/game-assets/loading/panel-4.svg": loadingArt("Discipline Chain", "#ffb84d"),
  "public/game-assets/loading/panel-5.svg": loadingArt("Void Cartography", "#9b2dff"),
  "public/game-assets/relics/focus-lens.svg": relicArt("Focus Lens", "#7a5cff"),
  "public/game-assets/relics/memory-core.svg": relicArt("Memory Core", "#5cff9b"),
  "public/game-assets/relics/void-seal.svg": relicArt("Void Seal", "#9b2dff"),
  "public/game-assets/relics/signal-cache.svg": relicArt("Signal Cache", "#4dc4ff"),
  "public/game-assets/relics/shadow-shard.svg": relicArt("Shadow Shard", "#4a3d6b"),
}

for (const [rel, content] of Object.entries(files)) {
  const full = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
  console.log("wrote", rel)
}
