import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { AtmosphericBackground } from "@/components/layout/AtmosphericBackground"
import { HomeTerminal } from "@/components/layout/HomeTerminal"
import { LandingWhispers } from "@/components/layout/LandingWhispers"

export default function HomePage() {
  const configured = isSupabaseConfigured()

  return (
    <AtmosphericBackground>
      {!configured && (
        <div className="mx-auto w-full max-w-lg px-6 pt-8">
          <SupabaseSetupNotice />
        </div>
      )}
      <LandingWhispers />
      <HomeTerminal />
    </AtmosphericBackground>
  )
}
