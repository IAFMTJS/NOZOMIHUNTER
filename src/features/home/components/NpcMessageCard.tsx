import { NPC_DIALOGUE_CONFIG } from "@/config/npcDialogueConfig"
import { GameAssetImage } from "@/components/ui/GameAssetImage"

interface NpcMessageCardProps {
  message: string
}

export function NpcMessageCard({ message }: NpcMessageCardProps) {
  const iris = NPC_DIALOGUE_CONFIG.iris
  return (
    <section className="nozomi-npc-message flex gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--overlay-subtle)] p-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[var(--accent)]/50">
        <GameAssetImage assetKey="npc.iris.portrait" alt={iris.label} fill className="object-cover" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-[var(--accent-bright)]">
          {iris.label} · {iris.role}
        </p>
        <p className="mt-1 text-sm italic text-[var(--foreground)]">&ldquo;{message}&rdquo;</p>
      </div>
    </section>
  )
}
