import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { WalletProvider } from "@/components/providers/wallet-provider"
import { Toaster } from "@/components/ui/toaster"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Darkpool | Decentralized Prediction Market",
  description: "Hidden predictions, revealed outcomes. A commit-reveal prediction market on Aptos blockchain.",
  keywords: ["prediction market", "aptos", "blockchain", "crypto", "darkpool", "defi"],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#1a1625",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen bg-background">
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
