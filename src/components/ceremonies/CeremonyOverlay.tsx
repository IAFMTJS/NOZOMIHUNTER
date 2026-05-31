"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import type { ReactNode } from "react"
import { useFocusTrap } from "@/hooks/useFocusTrap"

export type CeremonyIntensity = "default" | "slam"

interface CeremonyOverlayProps {
  open: boolean
  onDismiss?: () => void
  ariaLabelledBy?: string
  children: ReactNode
  className?: string
  intensity?: CeremonyIntensity
}

export function CeremonyOverlay({
  open,
  onDismiss,
  ariaLabelledBy,
  children,
  className = "",
  intensity = "default",
}: CeremonyOverlayProps) {
  const slam = intensity === "slam"
  const cardRef = useRef<HTMLDivElement>(null)
  useFocusTrap(cardRef, open)

  useEffect(() => {
    if (!open || !onDismiss) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onDismiss])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MOTION.panel}
          className={`nozomi-ceremony-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 ${
            slam ? "nozomi-ceremony-overlay--slam" : ""
          } ${className}`}
          role="dialog"
          aria-modal
          aria-labelledby={ariaLabelledBy}
          onClick={onDismiss}
        >
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={MOTION.panel}
            className={`nozomi-ceremony-card w-full space-y-5 p-6 text-center ${
              slam ? "nozomi-ceremony-card--slam max-w-lg" : "max-w-sm"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
