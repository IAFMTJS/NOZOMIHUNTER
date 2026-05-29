import { z } from "zod"

const economySchema = z.object({
  credits: z.number().int().min(0).optional(),
  stamina: z.number().int().min(0).optional(),
  staminaMax: z.number().int().min(1).optional(),
  brewTokens: z.number().int().min(0).optional(),
})

const inventoryItemSchema = z.object({
  itemKey: z.string(),
  quantity: z.number().int().min(0),
  name: z.string().optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
})

const rpgStatsSchema = z.object({
  strength: z.number().int().min(0),
  agility: z.number().int().min(0),
  intelligence: z.number().int().min(0),
  vitality: z.number().int().min(0),
})

export const PlayerSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1),
  level: z.number().int().min(1),
  xp: z.number().int().min(0),
  rank: z.enum(["E", "D", "C", "B", "A", "S", "SS", "SSS"]),
  rpgStats: rpgStatsSchema.optional(),
  economy: economySchema.optional(),
  inventory: z.array(inventoryItemSchema).optional(),
  trackedQuestId: z.string().nullable().optional(),
})

export const QuestSnapshotSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  narrativeTier: z.enum(["MAIN", "SIDE", "DAILY"]).optional(),
  rewards: z.object({
    xp: z.number(),
    credits: z.number().optional(),
    items: z
      .array(
        z.union([
          z.string(),
          z.object({ itemKey: z.string(), quantity: z.number().int().min(1) }),
        ])
      )
      .optional(),
  }),
  objectives: z.array(
    z.object({
      id: z.string(),
      description: z.string().optional(),
      currentProgress: z.number(),
      requiredProgress: z.number(),
      completed: z.boolean(),
      hidden: z.boolean().optional(),
      revealAt: z.number().optional(),
    })
  ),
  vocabularyEncounter: z
    .object({ words: z.array(z.object({ id: z.string() })) })
    .optional(),
  conversationEncounter: z
    .object({ messages: z.array(z.object({ id: z.string() })) })
    .optional(),
  speechEncounter: z
    .object({ phrases: z.array(z.object({ id: z.string() })) })
    .optional(),
  listeningEncounter: z
    .object({ fragments: z.array(z.object({ id: z.string() })) })
    .optional(),
}).superRefine((quest, ctx) => {
  const t = quest.type
  if (t === "VOCABULARY" && !(quest.vocabularyEncounter?.words.length ?? 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "VOCABULARY quest missing vocabularyEncounter.words",
    })
  }
  if (t === "CONVERSATION" && !(quest.conversationEncounter?.messages.length ?? 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "CONVERSATION quest missing conversationEncounter.messages",
    })
  }
  if (t === "SPEECH" && !(quest.speechEncounter?.phrases.length ?? 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "SPEECH quest missing speechEncounter.phrases",
    })
  }
  if (t === "LISTENING" && !(quest.listeningEncounter?.fragments.length ?? 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "LISTENING quest missing listeningEncounter.fragments",
    })
  }
})
