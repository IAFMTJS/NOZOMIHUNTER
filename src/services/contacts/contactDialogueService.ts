import {
  loadNpcRelationship,
  upsertNpcRelationship,
} from "@/services/supabase/relationshipRepository"
import {
  pickContactDialogue,
  type ContactDialogueBranch,
} from "@/systems/contacts/contactDialogueSystem"
import { RELATIONSHIP_TRUST_DEFAULT } from "@/systems/contracts/relationshipSystem"

export async function loadContactDialogueState(
  userId: string,
  npcKey: string
): Promise<{ trust: number; branch: ContactDialogueBranch }> {
  const row = await loadNpcRelationship(userId, npcKey)
  const trust = row?.trust ?? RELATIONSHIP_TRUST_DEFAULT
  const branch = parseDialogueBranch(row?.lastDialogueBranch)
  return { trust, branch }
}

export async function persistContactDialogueBranch(
  userId: string,
  npcKey: string,
  branch: ContactDialogueBranch,
  trust: number
): Promise<string> {
  const line = pickContactDialogue(npcKey, branch, trust)
  const now = new Date().toISOString()
  await upsertNpcRelationship({
    userId,
    npcKey,
    trust,
    successfulExchanges: 0,
    failedExchanges: 0,
    lastDialogueBranch: branch,
    updatedAt: now,
  })
  return line
}

function parseDialogueBranch(value: string | null | undefined): ContactDialogueBranch {
  if (value === "briefing" || value === "trust" || value === "greeting") {
    return value
  }
  return "greeting"
}
