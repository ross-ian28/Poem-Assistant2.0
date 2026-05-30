import type { Metadata } from "next"
import { Geist } from "next/font/google"
import SessionWrapper from "@/components/SessionWrapper"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Poem Assistant",
  description: "AI-powered poetry writing tools",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Poem Assistant",
    description: "AI-powered poetry writing tools",
    images: ["/logo.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  )
}