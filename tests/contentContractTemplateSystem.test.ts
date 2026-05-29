import { describe, expect, it } from "vitest"
import {
  pickContentContractTemplate,
  setContentContractTemplates,
} from "@/systems/content/contentContractTemplateSystem"

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
})
