export function logSystemEvent(
  system: string,
  event: string,
  payload?: unknown
) {
  console.log(`[${system}] ${event}`, payload)
}