export type UnlockCategory = "system" | "dungeon" | "title"

export interface UnlockRegistryEntry {
  label: string
  description: string
  category: UnlockCategory
}

const REGISTRY: Record<string, UnlockRegistryEntry> = {
  "system:conversation": {
    label: "Dialogue uplink",
    description: "Conversation contracts available on the board.",
    category: "system",
  },
  "system:speech": {
    label: "Voice channel",
    description: "Speech encounters unlocked for dispatch.",
    category: "system",
  },
  "system:listening": {
    label: "Signal intercept",
    description: "Listening contracts can appear on the board.",
    category: "system",
  },
  "system:dungeons": {
    label: "Dungeon sector",
    description: "Corridor operations unlocked at the command node.",
    category: "system",
  },
  "system:tutorial:intro": {
    label: "Hunter registry",
    description: "Intro briefing complete — full contract access.",
    category: "system",
  },
  "dungeon:neon-corridor": {
    label: "Neon Corridor",
    description: "First ranked corridor — decode, dialogue, breach the core.",
    category: "dungeon",
  },
  "dungeon:shadow-archive": {
    label: "Shadow Archive",
    description: "Deep storage sector — unstable signals and archive warden.",
    category: "dungeon",
  },
  "title:discipline-3": {
    label: "Discipline III",
    description: "Three-day synchronization chain maintained.",
    category: "title",
  },
  "title:discipline-7": {
    label: "Discipline VII",
    description: "Seven-day hunter continuity acknowledged.",
    category: "title",
  },
  "title:discipline-14": {
    label: "Discipline XIV",
    description: "Fourteen-day synchronization — registry commendation.",
    category: "title",
  },
}

function formatFallbackKey(key: string): UnlockRegistryEntry {
  const slug = key.split(":").pop() ?? key
  const label = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
  const category: UnlockCategory = key.startsWith("dungeon:")
    ? "dungeon"
    : key.startsWith("title:")
      ? "title"
      : "system"
  return {
    label,
    description: "Registry entry synchronized.",
    category,
  }
}

export function getUnlockEntry(key: string): UnlockRegistryEntry {
  return REGISTRY[key] ?? formatFallbackKey(key)
}

export function getUnlockLabel(key: string): string {
  return getUnlockEntry(key).label
}
