import type { Metadata } from 'next'
import { Bebas_Neue, Space_Grotesk } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mental Degens | MDGN — Built on Solana',
  description: 'Mental Degens — the most degen community on Solana. No mercy. No fear. Just degen.',
  icons: { icon: '/IMG/favicon.png' },
  openGraph: {
    title: 'Mental Degens | MDGN',
    description: 'No risk. No reward. No mercy. The most unhinged community on Solana.',
    siteName: 'Mental Degens',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-degen-black text-white font-body overflow-x-hidden">
        {/* Watermark background */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
          style={{
            backgroundImage: "url('/IMG/watermark.png')",
            backgroundSize: '40%',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
          }}
        />
        {children}
      </body>
    </html>
  )
}
