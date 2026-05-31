import type { MetadataRoute } from "next"
import { DEFAULT_THEME_BACKGROUND } from "@/styles/themeDefaults"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOZOMI — Hunter System",
    short_name: "NOZOMI",
    description: "Immersive Japanese-learning RPG",
    start_url: "/home",
    display: "standalone",
    background_color: DEFAULT_THEME_BACKGROUND,
    theme_color: DEFAULT_THEME_BACKGROUND,
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/app-icon-dark.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "/icons/app-icon-light.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
    ],
  }
}
