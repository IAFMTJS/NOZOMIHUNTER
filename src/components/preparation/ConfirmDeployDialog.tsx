"use client"

import { CeremonyOverlay } from "@/components/ceremonies/CeremonyOverlay"
import { Button } from "@/components/ui/Button"

export interface ConfirmDeployDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeployDialog({
  open,
  title,
  message,
  confirmLabel = "Deploy anyway",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDeployDialogProps) {
  return (
    <CeremonyOverlay open={open} onDismiss={onCancel} ariaLabelledBy="confirm-deploy-title">
      <h2
        id="confirm-deploy-title"
        className="font-display text-lg text-[var(--foreground)]"
      >
        {title}
      </h2>
      <p className="text-sm leading-relaxed text-[var(--muted)]">{message}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="cta" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </CeremonyOverlay>
  )
}
