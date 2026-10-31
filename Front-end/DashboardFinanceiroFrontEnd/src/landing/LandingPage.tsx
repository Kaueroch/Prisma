import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { FAQ } from './components/FAQ'
import { CTASection } from './components/CTASection'
import { Footer } from './components/Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-fg">
      <Navbar />
      <main className="bg-page-grid">
        <Hero />
        <Features />
        <HowItWorks />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}