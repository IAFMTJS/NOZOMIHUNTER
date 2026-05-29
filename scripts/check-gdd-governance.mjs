#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
let failed = false

function fail(msg) {
  console.error(`[gdd-governance] ${msg}`)
  failed = true
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8")
}

const gameModeRegistry = read("src/config/gameModeRegistry.ts")
if (!/pressure:\s*\{/.test(gameModeRegistry)) {
  fail("gameModeRegistry missing pressure profiles")
}

const corruption = read("src/config/corruptionThresholds.ts")
if (!corruption.includes("COLLAPSE")) {
  fail("corruptionThresholds missing COLLAPSE band")
}

const discipline = read("src/systems/progression/disciplineCurrencySystem.ts")
if (!discipline.includes("disciplineEarnedForQuest")) {
  fail("disciplineCurrencySystem earn path missing")
}

const relic = read("src/systems/inventory/relicEffectSystem.ts")
if (!relic.includes("aggregateRelicModifiers")) {
  fail("relicEffectSystem aggregate missing")
}

const assetManifest = read("src/systems/content/assetManifestSystem.ts")
if (!assetManifest.includes("resolveAssetUrl")) {
  fail("assetManifestSystem missing resolveAssetUrl")
}

const almostThere = read("src/systems/progression/almostThereSystem.ts")
if (!almostThere.includes("buildAlmostThereObjective")) {
  fail("almostThereSystem retention hook missing")
}

const home = read("src/features/home/components/HomeClient.tsx")
if (!home.includes("ActiveObjectiveCard")) {
  fail("home missing almost-there ActiveObjectiveCard")
}

if (!fs.existsSync(path.join(root, "docs/visual-parity-spec.md"))) {
  fail("visual-parity-spec.md missing")
}

if (!fs.existsSync(path.join(root, "supabase/migrations/021_asset_manifest.sql"))) {
  fail("021_asset_manifest migration missing")
}

const modeMatrix = read("docs/mode-differentiation-matrix.md")
if (!modeMatrix.includes("ENTITY_HUNT")) {
  fail("mode-differentiation-matrix missing ENTITY_HUNT")
}

const assetPipeline = read("docs/art-pipeline.md")
if (!assetPipeline.includes("ingest:assets")) {
  fail("art-pipeline.md missing ingest:assets")
}

const loading = read("src/components/layout/LoadingScreenOverlay.tsx")
if (!loading.includes("loadingPanelAssetKeys")) {
  fail("LoadingScreenOverlay missing manifest rotation")
}

const disciplineSpend = read("src/features/inventory/components/RelicSlotsRail.tsx")
if (!disciplineSpend.includes("spendDisciplineAmount")) {
  fail("RelicSlotsRail missing discipline spend UI")
}

if (!fs.existsSync(path.join(root, "flows/asset-ingest.md"))) {
  fail("flows/asset-ingest.md missing")
}

// Filter 1 — progression touch: XP mutations stay in systems/services
const featureFiles = []
function walkFeatures(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walkFeatures(p)
    else if (/\.(tsx|ts)$/.test(name)) featureFiles.push(p)
  }
}
walkFeatures(path.join(root, "src/features"))
for (const file of featureFiles) {
  const src = fs.readFileSync(file, "utf8")
  if (/\bplayer\.xp\s*[+]=/.test(src) || /\bsetPlayer\([^)]*xp:\s*player\.xp\s*\+/.test(src)) {
    fail(`progression touch in feature layer: ${path.relative(root, file)}`)
  }
}

// Filter 2 — mode identity registry
const modeIdentity = read("src/systems/gameModes/modeIdentitySystem.ts")
if (!modeIdentity.includes("assertModeIdentity")) {
  fail("modeIdentitySystem missing assertModeIdentity")
}

// Filter 3 — retention hooks on home + contracts
const contractsClient = read("src/features/contracts/components/ContractsClient.tsx")
if (!contractsClient.includes("dailyMilestoneProgress")) {
  fail("contracts missing daily milestone retention rail")
}

if (!fs.existsSync(path.join(root, "content/seeds/content-contracts.json"))) {
  fail("content-contracts.json seed missing")
}

if (!fs.existsSync(path.join(root, "supabase/migrations/023_gdd_completion.sql"))) {
  fail("023_gdd_completion migration missing")
}

const prestige = read("src/systems/progression/prestigeSystem.ts")
if (!prestige.includes("checkPrestigeEligibility")) {
  fail("prestigeSystem missing")
}

if (!fs.existsSync(path.join(root, "docs/gdd-completion-checklist.md"))) {
  fail("gdd-completion-checklist.md missing")
}

if (!fs.existsSync(path.join(root, "docs/analytics-dashboard.md"))) {
  fail("analytics-dashboard.md missing")
}

const liveMods = read("src/systems/live/liveEventModifierSystem.ts")
if (!liveMods.includes("applyLiveModifiersToQuestRewards")) {
  fail("liveEventModifierSystem missing reward application")
}

const audioCat = read("src/systems/audio/audioCategorySystem.ts")
if (!audioCat.includes("playCategoryStem")) {
  fail("audioCategorySystem missing category stems")
}

if (!fs.existsSync(path.join(root, "flows/story-template-ingest.md"))) {
  fail("flows/story-template-ingest.md missing")
}

if (!fs.existsSync(path.join(root, ".github/workflows/gdd-quality.yml"))) {
  fail("gdd-quality.yml CI workflow missing")
}

if (failed) process.exit(1)
console.log("[gdd-governance] OK")
