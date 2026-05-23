import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MissionDetailRedirectPage({ params }: PageProps) {
  const { id } = await params
  redirect(`/contracts/${id}`)
}
