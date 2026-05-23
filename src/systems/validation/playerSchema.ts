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
  rank: z.enum(["E", "D", "C", "B", "A", "S"]),
  rpgStats: rpgStatsSchema.optional(),
  economy: economySchema.optional(),
  inventory: z.array(inventoryItemSchema).optional(),
  trackedQuestId: z.string().nullable().optional(),
})

export const QuestSnapshotSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  narrativeTier: z.enum(["MAIN", "SIDE"]).optional(),
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
})
