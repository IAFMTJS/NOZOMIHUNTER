"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { Button } from "@/components/ui/Button"
import type { ItemCatalogEntryContract } from "@/contracts/economy-contract"
import {
  inventoryCapacityRemaining,
  inventoryUsed,
} from "@/systems/inventory/inventorySystem"
import { canPurchase, toShopListings } from "@/systems/economy/shopSystem"
import {
  fetchItemCatalog,
  purchaseShopItem,
  toggleItemEquipped,
} from "@/features/inventory/services/inventoryActions"

type View = "LOADOUT" | "SHOP"
type Cat = "ALL" | "EQUIPMENT" | "CONSUMABLE" | "MISC"

export function InventoryClient() {
  const { player, user } = useHunterSession()
  const [catalog, setCatalog] = useState<ItemCatalogEntryContract[]>([])
  const [view, setView] = useState<View>("LOADOUT")
  const [tab, setTab] = useState<Cat>("ALL")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void fetchItemCatalog().then(setCatalog)
  }, [])

  const shopListings = useMemo(() => toShopListings(catalog), [catalog])

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading loadout…</p>
      </HunterPage>
    )
  }

  const catalogMap = new Map(catalog.map((c) => [c.key, c]))
  const slots = player.inventory.filter((s) => {
    if (tab === "ALL") return true
    const cat = catalogMap.get(s.itemKey)?.category
    if (tab === "EQUIPMENT") return cat === "EQUIPMENT"
    if (tab === "CONSUMABLE") return cat === "CONSUMABLE"
    return cat === "MISC" || cat === "MATERIAL"
  })

  const used = inventoryUsed(player.inventory)
  const remaining = inventoryCapacityRemaining(player.inventory)

  async function handlePurchase(itemKey: string) {
    if (!user?.id || busy || !player) return
    const listing = shopListings.find((l) => l.key === itemKey)
    if (!listing || !canPurchase(player, listing, 1)) return
    setBusy(true)
    setMessage(null)
    try {
      await purchaseShopItem(user.id, itemKey, 1)
      setMessage(`Acquired ${listing.name}`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Purchase failed")
    } finally {
      setBusy(false)
    }
  }

  async function handleEquip(itemKey: string) {
    if (!user?.id || busy) return
    setBusy(true)
    setMessage(null)
    try {
      await toggleItemEquipped(user.id, itemKey, catalog)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Equip failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <HunterPage>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {(["LOADOUT", "SHOP"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
                view === v
                  ? "bg-[var(--accent)]/30 text-[var(--accent-bright)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--reward)]">
          {player.economy.credits} credits
        </span>
      </div>

      {message && (
        <p className="mb-3 text-center text-xs text-[var(--muted)]">{message}</p>
      )}

      {view === "SHOP" ? (
        <ul className="space-y-2">
          {shopListings.map((listing) => {
            const ok = canPurchase(player, listing, 1)
            return (
              <li
                key={listing.key}
                className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3"
              >
                <div>
                  <p className="text-sm text-[var(--foreground)]">{listing.name}</p>
                  <p className="text-[10px] uppercase text-[var(--muted)]">
                    {listing.category} · {listing.creditPrice} cr
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!ok || busy}
                  onClick={() => void handlePurchase(listing.key)}
                >
                  Buy
                </Button>
              </li>
            )
          })}
          {shopListings.length === 0 && (
            <p className="text-sm text-[var(--muted)]">Supply channel offline.</p>
          )}
        </ul>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["ALL", "EQUIPMENT", "CONSUMABLE", "MISC"] as Cat[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
                  tab === t
                    ? "bg-[var(--accent)]/30 text-[var(--accent-bright)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {slots.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              No items cached. Visit the shop or complete contracts.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => {
                const meta = catalogMap.get(s.itemKey)
                const isGear = meta?.category === "EQUIPMENT"
                return (
                  <button
                    key={s.itemKey}
                    type="button"
                    disabled={busy || !isGear}
                    onClick={() => isGear && void handleEquip(s.itemKey)}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border p-2 text-center ${
                      s.equipped
                        ? "border-[var(--accent-bright)] bg-[var(--accent)]/20"
                        : "border-[var(--border-subtle)] bg-black/30"
                    } ${isGear ? "cursor-pointer hover:border-[var(--accent)]" : ""}`}
                  >
                    <span className="text-[10px] uppercase text-[var(--muted)]">
                      {meta?.icon ?? "?"}
                    </span>
                    <span className="mt-1 line-clamp-2 text-[9px] text-[var(--foreground)]">
                      {meta?.name ?? s.itemKey}
                    </span>
                    <span className="absolute right-1 top-1 rounded bg-[var(--accent)] px-1 text-[9px] font-bold text-white">
                      {s.quantity}
                    </span>
                    {s.equipped && (
                      <span className="absolute bottom-1 left-1 text-[8px] uppercase text-[var(--accent-bright)]">
                        EQ
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      <div className="mt-6 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-sm">
        <span className="text-[var(--muted)]">
          Capacity {used} / {used + remaining}
        </span>
        <Link href="/vocabulary" className="text-[var(--accent-bright)] hover:underline">
          Threat index
        </Link>
      </div>
    </HunterPage>
  )
}
