import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"

interface QuestOpsStripProps {
  stamina: number
  staminaMax: number
  trackedTitle?: string | null
  trackedHref?: string | null
  showRequest: boolean
  trainingHref?: string
  requestBusy?: boolean
  onRequest?: () => void
}

export function QuestOpsStrip({
  stamina,
  staminaMax,
  trackedTitle,
  trackedHref,
  showRequest,
  trainingHref,
  requestBusy,
  onRequest,
}: QuestOpsStripProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusChip
        label={`STA ${stamina}/${staminaMax}`}
        tone={stamina < 10 ? "danger" : "neutral"}
      />
      {trackedTitle && trackedHref && (
        <Link
          href={trackedHref}
          className="min-w-0 flex-1 truncate rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--accent-bright)]"
        >
          Tracked · {trackedTitle}
        </Link>
      )}
      {trainingHref && (
        <Link
          href={trainingHref}
          className="text-[10px] uppercase tracking-wider text-[var(--accent-bright)] hover:underline"
        >
          Training
        </Link>
      )}
      {showRequest && onRequest && (
        <Button
          variant="ghost"
          size="sm"
          disabled={requestBusy}
          data-testid={E2E_TEST_IDS.contractsRequest}
          onClick={onRequest}
          className="ml-auto shrink-0"
        >
          Request
        </Button>
      )}
    </div>
  )
}
