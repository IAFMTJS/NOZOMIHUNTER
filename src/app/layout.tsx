import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "NOZOMI — Hunter System",
  description: "Immersive Japanese-learning RPG",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
