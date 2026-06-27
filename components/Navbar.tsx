'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const navLinks = [
  { href: '/#home',       label: 'Home' },
  { href: '/#about',      label: 'About' },
  { href: '/#tokenomics', label: 'Tokenomics' },
  { href: '/#roadmap',    label: 'Roadmap' },
  { href: '/degen-diagnosis', label: 'Degen Diagnosis' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      id="navbar"
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'scrolled' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/IMG/mdgn-logo.png"
              alt="MDGN Logo"
              width={48} height={48}
              className="h-10 w-10 lg:h-12 lg:w-12 object-contain group-hover:scale-110 transition-transform duration-200"
            />
            {/* Show brand name on all sizes */}
            <span className="font-display text-xl sm:text-2xl lg:text-3xl tracking-wider text-white">
              MENTAL <span className="text-neon-green">DEGENS</span>
            </span>
          </Link>

          {/* Desktop nav links — hidden on mobile (bottom nav handles it) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${l.href === '/degen-diagnosis' ? 'text-neon-green' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA only — bottom nav has JOIN on mobile */}
          <a
            href="https://t.me/MentalDegens"
            target="_blank" rel="noopener noreferrer"
            className="hidden md:inline-flex btn-primary"
          >
            Join the Cult
          </a>

        </div>
      </div>
    </nav>
  )
}
