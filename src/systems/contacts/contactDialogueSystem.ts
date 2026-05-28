export type ContactDialogueBranch = "greeting" | "briefing" | "trust"

const LINES: Record<
  string,
  Record<ContactDialogueBranch, (trust: number) => string>
> = {
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

export function pickContactDialogue(
  npcKey: string,
  branch: ContactDialogueBranch,
  trust: number
): string {
  const npc = LINES[npcKey]
  if (!npc) return "…signal lost."
  return npc[branch](trust)
}
