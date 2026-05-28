import type { QuestContract } from "@/contracts/quest-contract"
import { buildEntryBriefing } from "@/systems/presentation/dungeonRunPresentation"
import { masterEntryBriefing } from "@/systems/presentation/dungeonMasterPresentation"
import { isDungeonV2Run } from "./dungeonV2Helpers"

export function getDungeonBriefing(quest: QuestContract): string {
  const run = quest.dungeonRun
  if (!run) return quest.description
  if (isDungeonV2Run(run)) {
    return masterEntryBriefing(run, buildEntryBriefing(run, quest.description))
  }
  if (run.masterId || run.dungeon.masterId) {
    return masterEntryBriefing(run, quest.description)
  }
  const boss = run.dungeon.boss?.name ?? "Unknown"
  const sectors = run.dungeon.encounters.length
  return `${quest.description} · ${sectors} sectors · Boss: ${boss}`
}
