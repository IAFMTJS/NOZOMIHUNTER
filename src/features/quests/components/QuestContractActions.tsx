import { Button } from "@/components/ui/Button"

interface QuestContractActionsProps {
  rewardXp: number
  disabled?: boolean
  canComplete: boolean
  showProgress?: boolean
  onProgress?: () => void
  onComplete: () => void
}

export function QuestContractActions({
  rewardXp,
  disabled,
  canComplete,
  showProgress,
  onProgress,
  onComplete,
}: QuestContractActionsProps) {
  return (
    <>
      <p className="mb-3 text-sm text-[var(--muted)]">Reward: {rewardXp} XP</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        {showProgress && onProgress && (
          <Button
            variant="ghost"
            size="md"
            disabled={disabled}
            onClick={onProgress}
            className="w-full sm:w-auto"
          >
            Progress
          </Button>
        )}
        <Button
          size="md"
          disabled={disabled || !canComplete}
          onClick={onComplete}
          className="w-full sm:w-auto"
        >
          Claim contract
        </Button>
      </div>
    </>
  )
}
