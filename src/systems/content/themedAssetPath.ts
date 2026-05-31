import type { ThemeMode } from "@/styles/themeDefaults"

export function lightVariantPath(assetPath: string): string {
  return assetPath.replace(/\.webp$/i, ".light.webp")
}

/** Map bundled asset path to light variant (`hero.foo.webp` → `hero.foo.light.webp`). */
export function resolveThemedAssetPath(
  assetPath: string,
  themeMode: ThemeMode
): string {
  if (themeMode !== "light" || !/\.webp$/i.test(assetPath)) {
    return assetPath
  }
  return lightVariantPath(assetPath)
}
