"use client"

import { useEffect, type RefObject } from "react"

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean
): void {
  useEffect(() => {
    if (!active || !containerRef.current) return

    const root = containerRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )

    const first = focusables()[0]
    first?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return
      const nodes = focusables()
      if (nodes.length === 0) return
      const firstNode = nodes[0]!
      const lastNode = nodes[nodes.length - 1]!
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault()
        lastNode.focus()
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault()
        firstNode.focus()
      }
    }

    root.addEventListener("keydown", onKeyDown)
    return () => {
      root.removeEventListener("keydown", onKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [active, containerRef])
}
