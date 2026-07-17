import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, Glitch } from '@react-three/postprocessing'
import { useReducedMotion } from '../hooks/useReducedMotion'
import DustParticles from './DustParticles'

export default function SceneBackground({ scrollProgress = 0 }) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) return null

  // 终端区干扰强度：0.5 之后逐渐出现
  const terminalIntensity = Math.max(0, (scrollProgress - 0.5) * 2)
  // 转场干扰强度：0.45-0.65 之间最强
  const warpStart = 0.45
  const warpEnd = 0.65
  let warpIntensity = 0
  if (scrollProgress > warpStart && scrollProgress < warpEnd) {
    const mid = (warpStart + warpEnd) / 2
    const halfRange = (warpEnd - warpStart) / 2
    warpIntensity = 1 - Math.abs(scrollProgress - mid) / halfRange
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <DustParticles scrollProgress={scrollProgress} />

        <EffectComposer>
          <Bloom
            intensity={0.2 + Math.sin(scrollProgress * Math.PI) * 0.2 + warpIntensity * 0.3}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.9}
          />
          <Noise opacity={0.06} />
          <Vignette eskil={false} offset={0.1} darkness={0.6} />

          {/* 转场电子干扰 */}
          {warpIntensity > 0.1 && (
            <Glitch
              delay={[1.5, 3.5]}
              duration={[0.1, 0.3]}
              strength={[0.1 + warpIntensity * 0.3, 0.3 + warpIntensity * 0.5]}
              active
              ratio={0.85}
            />
          )}

          {/* 终端区色散 */}
          {scrollProgress > 0.5 && (
            <ChromaticAberration offset={[0.001 + terminalIntensity * 0.002, 0.0005 + terminalIntensity * 0.001]} />
          )}
        </EffectComposer>
      </Canvas>
    </div>
  )
}
