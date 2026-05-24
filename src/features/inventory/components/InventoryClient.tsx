"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ItemTile } from "@/components/ui/screen/ItemTile"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import type { ItemCatalogEntryContract, InventorySlotContract } from "@/contracts/economy-contract"
import {
  inventoryCapacityRemaining,
  inventoryUsed,
} from "@/systems/inventory/inventorySystem"
import { canPurchase, toShopListings } from "@/systems/economy/shopSystem"
import { getItemEffect } from "@/config/shopItemEffects"
import {
  activateConsumable,
  convertXpToCredits,
  fetchItemCatalog,
  purchaseShopItem,
  toggleItemEquipped,
} from "@/features/inventory/services/inventoryActions"
import { ShopPanel } from "@/features/inventory/components/ShopPanel"

type View = "LOADOUT" | "SHOP"
type Cat = "ALL" | "EQUIPMENT" | "CONSUMABLE" | "MISC"

export function InventoryClient() {
  const { player, user } = useHunterSession()
  const searchParams = useSearchParams()
  const manageMode = searchParams.get("mode") === "manage"
  const [catalog, setCatalog] = useState<ItemCatalogEntryContract[]>([])
  const [view, setView] = useState<View>("LOADOUT")
  const [tab, setTab] = useState<Cat>("ALL")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void fetchItemCatalog().then(setCatalog)
  }, [])

  const shopListings = useMemo(
    () => (player && user ? toShopListings(catalog, user.id) : []),
    [catalog, player, user]
  )

  if (!player || !user) {
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
    if (busy || !player || !user) return
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

  async function handleConvertXp(amount: number) {
    if (busy || !user) return
    setBusy(true)
    setMessage(null)
    try {
      await convertXpToCredits(user.id, amount)
      setMessage(`Converted ${amount} XP into credits`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Conversion failed")
    } finally {
      setBusy(false)
    }
  }

  async function handleActivate(itemKey: string) {
    if (busy || !user || !getItemEffect(itemKey)) return
    setBusy(true)
    setMessage(null)
    try {
      await activateConsumable(user.id, itemKey)
      setMessage("Enhancement activated")
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Activation failed")
    } finally {
      setBusy(false)
    }
  }

  async function handleEquip(itemKey: string) {
    if (busy || !user) return
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

      {message && view === "LOADOUT" && (
        <p className="mb-3 text-center text-xs text-[var(--muted)]">{message}</p>
      )}

      {view === "SHOP" ? (
        <ShopPanel
          player={player}
          userId={user.id}
          catalog={catalog}
          busy={busy}
          message={message}
          onPurchase={(key) => void handlePurchase(key)}
          onConvertXp={(amount) => void handleConvertXp(amount)}
        />
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
            <LoadoutGrid
              slots={slots}
              catalogMap={catalogMap}
              manageMode={manageMode}
              busy={busy}
              onEquip={handleEquip}
              onActivate={handleActivate}
            />
          )}
        </>
      )}

      <div className="nozomi-embedded mt-6 flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm">
        <span className="text-[var(--muted)]">
          Capacity {used} / {used + remaining}
        </span>
        <div className="flex gap-3">
          <Link
            href={manageMode ? "/inventory" : "/inventory?mode=manage"}
            className="text-[var(--accent-bright)] hover:underline"
          >
            {manageMode ? "Done" : "Manage"}
          </Link>
          <Link href="/vocabulary" className="text-[var(--accent-bright)] hover:underline">
            Threat index
          </Link>
        </div>
      </div>
    </HunterPage>
  )
}

function LoadoutGrid({
  slots,
  catalogMap,
  manageMode,
  busy,
  onEquip,
  onActivate,
}: {
  slots: InventorySlotContract[]
  catalogMap: Map<string, ItemCatalogEntryContract>
  manageMode: boolean
  busy: boolean
  onEquip: (key: string) => void
  onActivate: (key: string) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((s) => {
        const meta = catalogMap.get(s.itemKey)
        const isGear = meta?.category === "EQUIPMENT"
        const activatable = Boolean(getItemEffect(s.itemKey))
        return (
          <ItemTile
            key={s.itemKey}
            iconKey={meta?.icon ?? "crate"}
            name={meta?.name ?? s.itemKey}
            quantity={s.quantity}
            equipped={s.equipped}
            disabled={busy}
            onClick={
              manageMode && isGear
                ? () => void onEquip(s.itemKey)
                : activatable && manageMode
                  ? () => void onActivate(s.itemKey)
                  : undefined
            }
          />
        )
      })}
    </div>
  )
}
