/** Why getUserMedia may be blocked before the browser shows a permission prompt. */
export type MicrophoneAccessIssue =
  | null
  | "api-unavailable"
  | "insecure-local-network"
  | "insecure-remote"

function isPrivateLanHost(hostname: string): boolean {
  if (hostname.endsWith(".local")) return true
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
  return false
}

export function getMicrophoneAccessIssue(): MicrophoneAccessIssue {
  if (typeof window === "undefined") return "api-unavailable"
  if (!navigator.mediaDevices?.getUserMedia) return "api-unavailable"
  if (window.isSecureContext) return null

  const host = window.location.hostname
  if (isPrivateLanHost(host)) return "insecure-local-network"
  return "insecure-remote"
}

export function canAccessMicrophone(): boolean {
  return getMicrophoneAccessIssue() === null
}

export function getMicrophoneAccessHint(issue: MicrophoneAccessIssue): string {
  switch (issue) {
    case null:
      return ""
    case "api-unavailable":
      return "Microphone API unavailable in this browser."
    case "insecure-local-network":
      return (
        "Opening the dev server as http://192.168.x.x on your phone is not a secure context — " +
        "the browser will not show a mic prompt. Run npm run dev:mobile, then open the https:// address " +
        "(accept the certificate warning), or use a tunnel."
      )
    case "insecure-remote":
      return "Microphone requires HTTPS or localhost."
  }
}
