/** Routes where ContractHub encounter overlay may cover the page (after deploy). */
export function isEncounterOverlayRoute(pathname: string): boolean {
  return (
    pathname === "/contracts" ||
    pathname === "/missions" ||
    pathname === "/dungeons"
  )
}
