import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { StatsBar } from '@/components/landing/StatsBar'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
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
      <CTASection />
      <Footer />
    </>
  )
}
