import Navbar      from '@/components/Navbar'
import Hero        from '@/components/Hero'
import About       from '@/components/About'
import Tokenomics  from '@/components/Tokenomics'
import Roadmap     from '@/components/Roadmap'
import CTABanner   from '@/components/CTABanner'
import Footer      from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Tokenomics />
        <Roadmap />
        <CTABanner />
      </main>
      <Footer />
    </>
  )
}
