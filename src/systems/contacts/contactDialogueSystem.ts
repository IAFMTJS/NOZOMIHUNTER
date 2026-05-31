import type { IrisTrustTier } from "@/contracts/narrative-contract"
import { irisTrustTierFromScore } from "@/contracts/narrative-contract"
import irisDialogueTrees from "../../../content/narrative/iris/dialogue-trees.json"

export type ContactDialogueBranch = "greeting" | "briefing" | "trust"

type IrisBranchMap = Record<IrisTrustTier, string[]>

interface IrisDialoguePack {
  branches: Record<ContactDialogueBranch, IrisBranchMap>
  actOverrides?: Record<string, { briefing?: string }>
}

const IRIS_PACK = irisDialogueTrees as IrisDialoguePack

const LINES: Record<
  string,
  Record<ContactDialogueBranch, (trust: number, actId?: string) => string>
> = {
  iris: {
    greeting: (trust) => pickIrisLine("greeting", trust),
    briefing: (trust, actId) => {
      const override = actId ? IRIS_PACK.actOverrides?.[actId]?.briefing : undefined
      if (override) return override
      return pickIrisLine("briefing", trust)
    },
    trust: (trust) =>
      pickIrisLine("trust", trust).replace("{trust}", String(trust)),
  },
  "operator-7": {
    greeting: (t) =>
      t >= 60
        ? "You're back on-channel. I've held your slot open."
        : "Operator 7 online. State your clearance.",
    briefing: (t) =>
      t >= 40
        ? "Daily rituals are indexed — don't burn stamina on side noise first."
        : "Stick to the ritual board until your rank stabilizes.",
    trust: (t) =>
      t >= 80
        ? "Full trust vector. I'll route whisper hunts when you're ready."
        : `Trust at ${t} — complete contracts to deepen the link.`,
  },
  archivist: {
    greeting: (t) =>
      t >= 50
        ? "The archive remembers you. Which fragment shall we recover?"
        : "Speak softly. The glyphs are listening.",
    briefing: () =>
      "Archive Recovery missions map to story chapters — extract in order.",
    trust: (t) =>
      t >= 70
        ? "You've earned deeper files. Shadow sectors may answer now."
        : `Trust ${t}/100 — forbidden chains remain sealed.`,
  },
}

function pickIrisLine(branch: ContactDialogueBranch, trust: number): string {
  const tier = irisTrustTierFromScore(trust)
  const pool = IRIS_PACK.branches[branch]?.[tier] ?? IRIS_PACK.branches[branch]?.UNKNOWN
  if (!pool?.length) return "…signal lost."
  const idx = trust % pool.length
  return pool[idx] ?? pool[0]!
}

export function pickContactDialogue(
  npcKey: string,
  branch: ContactDialogueBranch,
  trust: number,
  actId?: string
): string {
  if (npcKey === "iris") {
    return LINES.iris[branch](trust, actId)
  }
  const npc = LINES[npcKey]
  if (!npc) return "…signal lost."
  return npc[branch](trust, actId)
}

export function irisTrustTierForContact(trust: number): IrisTrustTier {
  return irisTrustTierFromScore(trust)
}
