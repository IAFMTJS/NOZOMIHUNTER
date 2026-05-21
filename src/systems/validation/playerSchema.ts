import { z } from "zod"

export const PlayerSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1),
  level: z.number().int().min(1),
  xp: z.number().int().min(0),
  rank: z.enum(["E", "D", "C", "B", "A", "S"]),
})

export const QuestSnapshotSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  rewards: z.object({ xp: z.number() }),
  objectives: z.array(
    z.object({
      id: z.string(),
      currentProgress: z.number(),
      requiredProgress: z.number(),
      completed: z.boolean(),
    })
  ),
})
