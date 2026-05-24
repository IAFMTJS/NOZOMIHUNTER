"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MOTION } from "@/config/motionPresets"
import type { ReactNode } from "react"

interface CeremonyOverlayProps {
  open: boolean
  onDismiss?: () => void
  ariaLabelledBy?: string
  children: ReactNode
  className?: string
}

export function CeremonyOverlay({
  open,
  onDismiss,
  ariaLabelledBy,
  children,
  className = "",
}: CeremonyOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MOTION.panel}
          className={`nozomi-ceremony-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 ${className}`}
          role="dialog"
          aria-modal
          aria-labelledby={ariaLabelledBy}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={MOTION.panel}
            className="nozomi-ceremony-card w-full max-w-sm space-y-5 p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
