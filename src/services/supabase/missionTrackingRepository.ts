import { updateTrackedQuestRow } from "@/services/supabase/economyRepository"
import { findActiveQuestRowId } from "@/services/supabase/playerRepository"

export async function persistTrackedMission(
  userId: string,
  questId: string
): Promise<void> {
  const rowId = await findActiveQuestRowId(userId, questId)
  await updateTrackedQuestRow(userId, rowId)
}
