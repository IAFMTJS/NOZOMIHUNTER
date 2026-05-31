import { createClient } from "@/lib/supabase/client"

export type PushSubscriptionJson = {
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

function requireClient() {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured")
  return supabase
}

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionJson
): Promise<boolean> {
  const supabase = requireClient()
  const { error } = await supabase.rpc("upsert_push_subscription", {
    p_user_id: userId,
    p_subscription: subscription,
  })
  return !error
}

export async function deactivatePushSubscription(
  userId: string,
  endpoint: string
): Promise<boolean> {
  const supabase = requireClient()
  const { error } = await supabase.rpc("deactivate_push_subscription", {
    p_user_id: userId,
    p_endpoint: endpoint,
  })
  return !error
}
