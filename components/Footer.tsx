import Image from 'next/image'
import Link from 'next/link'

const navLinks = [
  { href: '/#home',       label: 'Home' },
  { href: '/#about',      label: 'About' },
  { href: '/#tokenomics', label: 'Tokenomics' },
  { href: '/#roadmap',    label: 'Roadmap' },
  { href: '/mental-scan', label: 'Mental Scan' },
]

export default function Footer() {
  return (
    <footer className="bg-degen-black border-t border-degen-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3">
              <Image src="/IMG/mdgn-logo.png" alt="MDGN" width={40} height={40} className="object-contain" />
              <span className="font-display text-2xl tracking-wider">
                MENTAL <span className="text-neon-green">DEGENS</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm">No Risk. No Reward. No Mercy.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="hover:text-neon-green transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Socials */}
          <div className="flex items-center gap-4">
            {/* X */}
            <a href="https://x.com/MentalDegen" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X / Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* Telegram */}
            <a href="https://t.me/MentalDegens" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Telegram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
            {/* Pump.fun */}
            <a href="https://pump.fun/profile/mentaldegens" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Pump.fun">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-degen-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>&copy; 2025 Mental Degens. All rights reserved.</p>
          <p>$MDGN is a community token. Not financial advice. DYOR.</p>
        </div>
      </div>
    </footer>
  )
}
