import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Degen Diagnosis | Mental Degens',
  description: 'Submit your Solana wallet for a full psychiatric evaluation by Dr. H. Opium, M.D. — Chief Psychologist of the Degen Asylum. Get your official DSM-D diagnosis, archetype, and patient report.',
  openGraph: {
    title: 'Degen Diagnosis — The Degen Asylum',
    description: 'Get diagnosed by Dr. H. Opium. Real on-chain behavioral analysis. No mercy.',
    siteName: 'Mental Degens',
  },
}

export default function DegenDiagnosisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
