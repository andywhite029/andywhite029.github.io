import { useScrollProgress } from '../context/ScrollProgressContext'
import Sidebar from '../components/Sidebar'
import MobileHeader from '../components/MobileHeader'
import LanguageToggle from '../components/LanguageToggle'
import FilmStripEdge from '../components/FilmStripEdge'
import GrainOverlay from '../components/GrainOverlay'
import FlareOverlay from '../components/FlareOverlay'
import SceneBackground from '../components/SceneBackground'
import HeroSection from '../components/sections/HeroSection'
import AboutSection from '../components/sections/AboutSection'
import ExperienceSection from '../components/sections/ExperienceSection'
import ProjectsSection from '../components/sections/ProjectsSection'
import ContactSection from '../components/sections/ContactSection'

export default function Home() {
  const { scrollProgress } = useScrollProgress()

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* 语言切换 */}
      <LanguageToggle />

      {/* 左侧大型胶片齿孔装饰 */}
      <FilmStripEdge />

      {/* 动态背景：噪点 + 炫光 + 3D 粒子 */}
      <GrainOverlay />
      <FlareOverlay />
      <SceneBackground scrollProgress={scrollProgress} />

      {/* 移动端顶部导航 */}
      <MobileHeader />

      <div className="mx-auto flex max-w-6xl lg:gap-12 lg:ml-20">
        {/* 左侧固定导航 */}
        <Sidebar />

        {/* 右侧内容 */}
        <main className="flex-1 px-6 py-16 lg:py-24 lg:pr-12 xl:pr-24">
          <HeroSection />
          <AboutSection />
          <ExperienceSection />
          <ProjectsSection />
          <ContactSection />
        </main>
      </div>
    </div>
  )
}
