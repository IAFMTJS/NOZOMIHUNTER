import { DungeonDetailClient } from "@/features/dungeons/components/DungeonDetailClient"

export default async function DungeonDetailPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  return <DungeonDetailClient dungeonKey={decodeURIComponent(key)} />
}
