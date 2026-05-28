import { ImageResponse } from "next/og"
import { DEFAULT_THEME_BACKGROUND, THEME_COLORS } from "@/styles/themeDefaults"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: DEFAULT_THEME_BACKGROUND,
          borderRadius: 6,
          color: THEME_COLORS.dark.accent,
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        望
      </div>
    ),
    { ...size }
  )
}
