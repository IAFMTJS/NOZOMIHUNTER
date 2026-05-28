"use client"

/** Subtle rain + fog overlay for the public entry screen. */
export function LandingWeatherLayer() {
  return (
    <div className="nozomi-landing-weather pointer-events-none fixed inset-0 z-[1]" aria-hidden>
      <div className="nozomi-landing-fog" />
      <div className="nozomi-landing-rain" />
    </div>
  )
}
