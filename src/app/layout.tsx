import type { Metadata, Viewport } from "next"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"
import "./fonts.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "NOZOMI — Hunter System",
  description: "Immersive Japanese-learning RPG",
  applicationName: "NOZOMI",
  appleWebApp: {
    capable: true,
    title: "NOZOMI",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
