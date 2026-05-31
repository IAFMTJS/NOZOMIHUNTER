import { describe, expect, it } from "vitest"
import {
  buildQuestFromContentTemplate,
  pickContentContractTemplate,
  setContentContractTemplates,
} from "@/systems/content/contentContractTemplateSystem"
import type { PlayerContract } from "@/contracts/player-contract"

describe("contentContractTemplateSystem", () => {
  it("picks story channel from pool", () => {
    setContentContractTemplates([
      {
        id: "story-1",
        title: "Main",
        channel: "story",
        template: {
          description: "Story op",
          narrativeTier: "MAIN",
          type: "VOCABULARY",
          wordCount: 3,
        },
      },
      {
        id: "side-1",
        title: "Side",
        channel: "side",
        template: {
          description: "Side op",
          narrativeTier: "SIDE",
          type: "VOCABULARY",
          wordCount: 2,
        },
      },
    ])
    const picked = pickContentContractTemplate("story", "player-a", "2026-05-29")
    expect(picked?.channel).toBe("story")
  })

  it("builds conversation quest with template scenarioId", () => {
    const template = {
      id: "side-iris",
      title: "Iris Briefing",
      channel: "side",
      template: {
        description: "Briefing op",
        type: "CONVERSATION" as const,
        gameMode: "GHOST_INTERROGATION" as const,
        scenarioId: "iris-briefing",
        narrativeTier: "SIDE" as const,
      },
    }
    const player = { id: "p1", level: 5 } as PlayerContract
    const quest = buildQuestFromContentTemplate(template, player)
    expect(quest.scenarioId).toBe("iris-briefing")
  })
})
