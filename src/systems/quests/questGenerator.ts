import type { QuestContract, QuestType } from "@/contracts/quest-contract"

const MVP_TEMPLATES: Omit<QuestContract, "id">[] = [
  {
    type: "VOCABULARY",
    title: "Word Hunt",
    description: "Review 5 vocabulary targets in context.",
    difficulty: "EASY",
    rewards: { xp: 50 },
    objectives: [
      {
        id: "obj-1",
        description: "Complete vocabulary review",
        currentProgress: 0,
        requiredProgress: 5,
        completed: false,
      },
    ],
  },
  {
    type: "LISTENING",
    title: "Signal Scan",
    description: "Parse 3 listening fragments.",
    difficulty: "NORMAL",
    rewards: { xp: 75 },
    objectives: [
      {
        id: "obj-1",
        description: "Complete listening checks",
        currentProgress: 0,
        requiredProgress: 3,
        completed: false,
      },
    ],
  },
  {
    type: "GRAMMAR",
    title: "Syntax Patrol",
    description: "Resolve 4 grammar encounters.",
    difficulty: "NORMAL",
    rewards: { xp: 80 },
    objectives: [
      {
        id: "obj-1",
        description: "Complete grammar encounters",
        currentProgress: 0,
        requiredProgress: 4,
        completed: false,
      },
    ],
  },
  {
    type: "SPEECH",
    title: "Voice Trial",
    description: "Complete 2 speech checks.",
    difficulty: "HARD",
    rewards: { xp: 100 },
    objectives: [
      {
        id: "obj-1",
        description: "Complete speech checks",
        currentProgress: 0,
        requiredProgress: 2,
        completed: false,
      },
    ],
  },
]

export function generateQuestForPlayer(
  playerLevel: number,
  seed?: number
): QuestContract {
  const index =
    seed !== undefined
      ? seed % MVP_TEMPLATES.length
      : Math.floor(Math.random() * MVP_TEMPLATES.length)

  const template = MVP_TEMPLATES[index]
  const difficulty =
    playerLevel < 5
      ? "EASY"
      : playerLevel < 15
        ? "NORMAL"
        : template.difficulty

  return {
    ...template,
    id: `quest-${Date.now()}-${index}`,
    difficulty,
    requirements: [
      { minimumLevel: Math.max(1, playerLevel - 2) },
    ],
  }
}

export function pickQuestTypeForLevel(level: number): QuestType {
  const types: QuestType[] = ["VOCABULARY", "LISTENING", "GRAMMAR", "SPEECH"]
  return types[level % types.length]
}
