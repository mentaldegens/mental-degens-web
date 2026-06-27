'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileBottomNav() {
  const path = usePathname()

  const isHome  = path === '/'
  const isScan  = path === '/mental-scan'

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Blur + dark base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(5,5,5,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      />

      <div className="relative flex items-end justify-around px-2 pb-safe">

        {/* Home */}
        <Link href="/" className="flex flex-col items-center gap-1 py-3 px-4 group">
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={isHome ? '#AAFF00' : '#6b7280'} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: isHome ? '#AAFF00' : '#6b7280' }}>
            Home
          </span>
        </Link>

        {/* Roadmap */}
        <Link href="/#roadmap" className="flex flex-col items-center gap-1 py-3 px-4">
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#6b7280" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <line x1="12" y1="20" x2="12" y2="10"/>
            <line x1="18" y1="20" x2="18" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="16"/>
          </svg>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-500">
            Roadmap
          </span>
        </Link>

        {/* Mental Scan — center feature button */}
        <Link href="/mental-scan" className="flex flex-col items-center gap-1 -mt-5 px-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={{
              background: isScan
                ? '#AAFF00'
                : 'linear-gradient(135deg, rgba(170,255,0,0.15) 0%, rgba(170,255,0,0.05) 100%)',
              border: `2px solid ${isScan ? '#AAFF00' : 'rgba(170,255,0,0.4)'}`,
              boxShadow: isScan ? '0 0 24px rgba(170,255,0,0.5)' : '0 0 12px rgba(170,255,0,0.15)',
            }}
          >
            <svg
              width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke={isScan ? '#000' : '#AAFF00'} strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <line x1="22" y1="12" x2="18" y2="12"/>
              <line x1="6" y1="12" x2="2" y2="12"/>
              <line x1="12" y1="6" x2="12" y2="2"/>
              <line x1="12" y1="22" x2="12" y2="18"/>
              <circle cx="12" cy="12" r="3" fill={isScan ? '#000' : '#AAFF00'} stroke="none"/>
            </svg>
          </div>
          <span
            className="text-[10px] font-bold tracking-wider uppercase mt-1"
            style={{ color: isScan ? '#AAFF00' : 'rgba(170,255,0,0.8)' }}
          >
            Scan
          </span>
        </Link>

        {/* Tokenomics */}
        <Link href="/#tokenomics" className="flex flex-col items-center gap-1 py-3 px-4">
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#6b7280" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-500">
            Token
          </span>
        </Link>

        {/* Join / Telegram */}
        <a
          href="https://t.me/MentalDegens"
          target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-3 px-4"
        >
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="#6b7280"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-500">
            Join
          </span>
        </a>

      </div>
    </div>
  )
}
