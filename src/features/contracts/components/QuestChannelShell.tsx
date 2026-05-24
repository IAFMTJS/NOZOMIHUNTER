import type { ReactNode } from "react"

interface QuestChannelShellProps {
  children: ReactNode
}

export function QuestChannelShell({ children }: QuestChannelShellProps) {
  return <div className="nozomi-screen-quests space-y-4">{children}</div>
}
