import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"
import { ThemeBootstrap } from "@/components/ThemeBootstrap"
import { DEFAULT_THEME, DEFAULT_THEME_BACKGROUND } from "@/styles/themeDefaults"
import { THEME_STORAGE_KEY } from "@/styles/themePreference"
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
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: DEFAULT_THEME_BACKGROUND,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Script id="nozomi-theme-bootstrap" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`}
        </Script>
        <ThemeBootstrap />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
