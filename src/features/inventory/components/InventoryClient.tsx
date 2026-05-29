"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ItemTile } from "@/components/ui/screen/ItemTile"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import type { ItemCatalogEntryContract, InventorySlotContract } from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import {
  inventoryCapacityRemaining,
  inventoryUsed,
} from "@/systems/inventory/inventorySystem"
import { canPurchase, canSell, sellQuote, sellUnitPrice, toShopListings } from "@/systems/economy/shopSystem"
import { getItemEffect } from "@/config/shopItemEffects"
import {
  activateConsumable,
  convertXpToCredits,
  fetchItemCatalog,
  purchaseShopItem,
  sellInventoryItem,
  toggleItemEquipped,
} from "@/features/inventory/services/inventoryActions"
import { ShopPanel } from "@/features/inventory/components/ShopPanel"
import { RelicSlotsRail } from "@/features/inventory/components/RelicSlotsRail"

type View = "LOADOUT" | "SHOP"
type Cat = "ALL" | "EQUIPMENT" | "CONSUMABLE" | "MISC"

export function InventoryClient() {
  const { player, user } = useHunterSession()
  const searchParams = useSearchParams()
  const manageMode = searchParams.get("mode") === "manage"
  const sellMode = searchParams.get("mode") === "sell"
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

  async function handleSell(itemKey: string) {
    if (busy || !player || !user) return
    const entry = catalogMap.get(itemKey)
    if (!entry || !canSell(player, entry, 1)) return
    setBusy(true)
    setMessage(null)
    try {
      const quote = sellQuote(player, entry, 1)
      await sellInventoryItem(user.id, itemKey, 1)
      setMessage(
        quote
          ? `Sold for ${quote.totalCredits} credits`
          : "Item sold"
      )
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sale failed")
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
          {(
            [
              { id: "LOADOUT" as View, label: "Inventory" },
              { id: "SHOP" as View, label: "Store" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
                view === id
                  ? "bg-[var(--accent)]/30 text-[var(--accent-bright)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {label}
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

      {view === "LOADOUT" && sellMode && (
        <p className="mb-3 text-center text-xs text-[var(--reward)]">
          Tap an item to sell for 50% of shop value. Unequip gear first.
        </p>
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
          <RelicSlotsRail player={player} />
          <div className="mb-4 mt-4 flex flex-wrap gap-2">
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
              player={player}
              manageMode={manageMode}
              sellMode={sellMode}
              busy={busy}
              onEquip={handleEquip}
              onActivate={handleActivate}
              onSell={handleSell}
            />
          )}
        </>
      )}

      <div className="nozomi-embedded mt-6 flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm">
        <span className="text-[var(--muted)]">
          Capacity {used} / {used + remaining}
        </span>
        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href={sellMode ? "/inventory" : "/inventory?mode=sell"}
            className={
              sellMode
                ? "text-[var(--reward)]"
                : "text-[var(--accent-bright)] hover:underline"
            }
          >
            {sellMode ? "Done selling" : "Sell"}
          </Link>
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
  player,
  manageMode,
  sellMode,
  busy,
  onEquip,
  onActivate,
  onSell,
}: {
  slots: InventorySlotContract[]
  catalogMap: Map<string, ItemCatalogEntryContract>
  player: PlayerContract
  manageMode: boolean
  sellMode: boolean
  busy: boolean
  onEquip: (key: string) => void
  onActivate: (key: string) => void
  onSell: (key: string) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((s) => {
        const meta = catalogMap.get(s.itemKey)
        const isGear = meta?.category === "EQUIPMENT"
        const activatable = Boolean(getItemEffect(s.itemKey))
        const unitSell = meta ? sellUnitPrice(meta) : null
        const sellable =
          sellMode &&
          meta != null &&
          unitSell != null &&
          canSell(player, meta, 1)
        const sellBlocked =
          sellMode &&
          meta != null &&
          unitSell != null &&
          !canSell(player, meta, 1)

        return (
          <ItemTile
            key={s.itemKey}
            iconKey={meta?.icon ?? "crate"}
            name={meta?.name ?? s.itemKey}
            quantity={s.quantity}
            equipped={s.equipped}
            sellPrice={sellMode ? unitSell ?? undefined : undefined}
            disabled={busy || (sellMode && sellBlocked)}
            onClick={
              sellable
                ? () => void onSell(s.itemKey)
                : manageMode && isGear
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
