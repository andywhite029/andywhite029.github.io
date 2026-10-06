import TopNav from '../components/TopNav'
import ProgressRail from '../components/ProgressRail'
import HeroSection from '../components/sections/HeroSection'
import GuanglunSection from '../components/sections/GuanglunSection'
import GuanglunQcraftTransition from '../components/GuanglunQcraftTransition'
import QCraftSection from '../components/sections/QCraftSection'
import AboutSection from '../components/sections/AboutSection'
import ContactSection from '../components/sections/ContactSection'
import BrandChapters from '../components/sections/BrandChapters'
import ProjectDetails from '../components/ProjectDetails'

export default function Home() {
  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <TopNav />
      <ProgressRail />
      <main id="main">
        <HeroSection />
        <GuanglunSection />
        <GuanglunQcraftTransition />
        <QCraftSection />
        <BrandChapters />
        <AboutSection />
        <ContactSection />
      </main>
      <ProjectDetails />
    </div>
  )
}
