import { HunterSessionProvider } from "@/features/hunter/context/HunterSessionContext"

export default function HunterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <HunterSessionProvider>{children}</HunterSessionProvider>
}
