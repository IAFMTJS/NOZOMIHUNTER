import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOZOMI — Hunter System",
    short_name: "NOZOMI",
    description: "Immersive Japanese-learning RPG",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  }
}
