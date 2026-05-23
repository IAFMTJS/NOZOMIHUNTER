import { WordDetailClient } from "@/features/vocabulary/components/WordDetailClient"

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <WordDetailClient entSeq={Number(id)} />
}
