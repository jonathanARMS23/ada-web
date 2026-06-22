import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { StatsBar } from '@/components/landing/StatsBar'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { RoutingTable } from '@/components/landing/RoutingTable'
import { TiersSection } from '@/components/landing/TiersSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <RoutingTable />
      <TiersSection />
      <CTASection />
      <Footer />
    </>
  )
}
