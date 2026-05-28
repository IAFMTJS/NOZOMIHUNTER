"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { ReactNode } from "react"
import { MOTION } from "@/config/motionPresets"
import type { QuestChannelTab } from "@/features/contracts/components/ContractsClient"

interface ContractChannelMotionProps {
  tab: QuestChannelTab
  children: ReactNode
}

const TAB_CLASS: Record<QuestChannelTab, string> = {
  daily: "nozomi-contract-channel-daily",
  story: "nozomi-contract-channel-story",
  side: "nozomi-contract-channel-side",
  achievements: "nozomi-contract-channel-achievements",
}

export function ContractChannelMotion({ tab, children }: ContractChannelMotionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab}
        className={TAB_CLASS[tab]}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={MOTION.panel}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
