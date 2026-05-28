import { describe, expect, it } from "vitest"
import { resolveArchiveContractLink } from "@/systems/archive/archiveContractSystem"
import type { ArchiveEntry } from "@/systems/archive/archiveSystem"

const unlockedEntry: ArchiveEntry = {
  id: "whisper-index",
  title: "Whisper index",
  teaser: "Teaser",
  locked: false,
}

describe("resolveArchiveContractLink", () => {
  it("returns contract href for unlocked whisper index", () => {
    const link = resolveArchiveContractLink(unlockedEntry, null)
    expect(link?.available).toBe(true)
    expect(link?.href).toContain("/contracts/")
    expect(link?.href).toContain("tab=story")
  })

  it("marks locked entries unavailable", () => {
    const link = resolveArchiveContractLink(
      {
        ...unlockedEntry,
        id: "forbidden-kanji",
        locked: true,
        lockReason: "Sealed",
        linkedContractId: "story-shadow-archive",
      },
      null
    )
    expect(link?.available).toBe(false)
    expect(link?.reason).toBe("Sealed")
  })
})
