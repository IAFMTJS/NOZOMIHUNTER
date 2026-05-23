import { ContractDetailClient } from "@/features/contracts/components/ContractDetailClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ContractDetailPage({ params }: PageProps) {
  const { id } = await params
  return <ContractDetailClient questId={id} />
}
