import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useReducedMotion } from '../hooks/useReducedMotion'

/**
 * 首屏 WebGL 场景（three.js + @react-three/fiber）。
 *
 * 设计目标：让真实拍摄的 hero 影像「有生命」，而不是换掉它。
 * 1) 视频纹理平面：指针涟漪、滚动驱动的去饱和与轻微色散、暗角、细颗粒；
 * 2) 粒子场：缓慢漂移 + 指针推开 + 点击冲击波，滚动时被卷入漩涡并淡出；
 * 3) 性能：单 canvas、dpr 上限 1.75、离开视口或标签页隐藏时停帧，
 *    视频加载失败自动退回海报纹理，WebGL 不可用或 reduced-motion 时整体让位给原生视频。
 */

const VIDEO_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const VIDEO_FRAGMENT = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform vec2 uScreen;
  uniform float uVideoAspect;
  uniform float uProgress;
  uniform vec2 uPointer;
  uniform float uTime;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  vec2 coverUv(vec2 uv) {
    float screenAspect = uScreen.x / max(uScreen.y, 1.0);
    if (screenAspect > uVideoAspect) {
      uv.y = (uv.y - 0.5) * (uVideoAspect / screenAspect) + 0.5;
    } else {
      uv.x = (uv.x - 0.5) * (screenAspect / uVideoAspect) + 0.5;
    }
    return uv;
  }

  void main() {
    float aspect = uScreen.x / max(uScreen.y, 1.0);
    vec2 uv = coverUv(vUv);
    vec2 screen = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
    vec2 pointer = vec2(uPointer.x * aspect * 0.5, uPointer.y * 0.5);

    // 指针涟漪：靠近指针的位置产生一圈圈极轻微的位移
    float dist = distance(screen, pointer);
    float wave = sin(dist * 20.0 - uTime * 2.2) * smoothstep(0.6, 0.0, dist);
    vec2 ripple = normalize(screen - pointer + 1e-4) * wave * 0.0035 * (0.5 + uProgress);

    // 滚动时轻微色散，像镜头被推近
    float ca = 0.0008 + uProgress * 0.0026 + wave * 0.0012;
    vec2 st = uv + ripple;
    vec3 color;
    color.r = texture2D(uMap, st + vec2(ca, 0.0)).r;
    color.g = texture2D(uMap, st).g;
    color.b = texture2D(uMap, st - vec2(ca, 0.0)).b;

    // 滚动进度：去饱和 + 轻微压暗，为下一章的深空紫让出空间
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, vec3(luma), uProgress * 0.5);
    color *= 1.0 - uProgress * 0.16;

    // 暗角
    float vignette = smoothstep(1.3, 0.35, length(screen) * 1.5);
    color *= mix(0.5, 1.0, vignette);

    // 细颗粒
    float grain = hash(vUv * uScreen + uTime * 60.0) - 0.5;
    color += grain * (0.03 + uProgress * 0.02);

    gl_FragColor = vec4(color, 1.0);
  }
`

const PARTICLE_VERTEX = `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uPointer;
  uniform float uBurst;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec3 p = position;
    float t = uTime * 0.12;
    p.x += sin(t + aSeed * 6.2831 + p.y * 2.0) * 0.022;
    p.y += cos(t * 0.8 + aSeed * 6.2831 + p.x * 2.0) * 0.022;

    // 指针：靠近的粒子被轻轻推开
    vec2 d = p.xy - uPointer;
    float dist = length(d);
    float near = smoothstep(0.5, 0.0, dist);
    p.xy += normalize(d + 1e-4) * near * 0.07;

    // 点击冲击波
    float burstK = (1.0 - clamp(uBurst, 0.0, 1.0)) * step(uBurst, 1.0);
    p.xy += normalize(p.xy + 1e-4) * burstK * 0.09;

    // 滚动：绕中心旋转并被放大，最后淡出
    float angle = uProgress * 2.4 * (1.0 - length(p.xy) * 0.5);
    float s = sin(angle);
    float c = cos(angle);
    p.xy = mat2(c, -s, s, c) * p.xy;
    p.xy *= 1.0 + uProgress * 0.5;

    vAlpha = (0.28 + 0.72 * near) * (1.0 - uProgress * 0.8);
    vSeed = aSeed;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (1.0 + near * 1.2 + burstK * 1.5);
  }
`

const PARTICLE_FRAGMENT = `
  precision highp float;
  varying float vAlpha;
  varying float vSeed;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.0, r) * vAlpha * 0.55;
    vec3 color = mix(uColorA, uColorB, vSeed);
    gl_FragColor = vec4(color, alpha);
  }
`

function supportsWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl')
    const ok = Boolean(context)
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}

function VideoPlane({ texture, pointerRef }) {
  const { size, viewport } = useThree()
  const materialRef = useRef(null)
  const uniforms = useMemo(
    () => ({
      uMap: { value: null },
      uScreen: { value: new THREE.Vector2(1, 1) },
      uVideoAspect: { value: 16 / 9 },
      uProgress: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
    }),
    [],
  )

  useEffect(() => {
    uniforms.uMap.value = texture
  }, [texture, uniforms])

  useEffect(() => {
    uniforms.uScreen.value.set(size.width, size.height)
  }, [size, uniforms])

  useFrame((_state, delta) => {
    const material = materialRef.current
    if (!material) return
    const current = material.uniforms
    current.uTime.value += delta
    current.uPointer.value.lerp(pointerRef.current, 0.08)

    const hero = document.getElementById('andy')
    if (hero) {
      const range = Math.max(1, hero.offsetHeight - window.innerHeight)
      current.uProgress.value = THREE.MathUtils.clamp(window.scrollY / range, 0, 1)
    }

    const image = texture?.image
    if (image) {
      const width = image.videoWidth || image.naturalWidth || image.width
      const height = image.videoHeight || image.naturalHeight || image.height
      if (width && height) current.uVideoAspect.value = width / height
    }
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VIDEO_VERTEX}
        fragmentShader={VIDEO_FRAGMENT}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

function ParticleField({ pointerRef, burstRef }) {
  const { size, viewport } = useThree()
  const count = size.width < 768 ? 1400 : 4200
  const materialRef = useRef(null)

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const seeds = new Float32Array(count)
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = Math.random() * 2 - 1
      positions[index * 3 + 1] = Math.random() * 2 - 1
      positions[index * 3 + 2] = 0
      sizes[index] = 1.1 + Math.random() * 2.4
      seeds[index] = Math.random()
    }
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    buffer.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    buffer.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return buffer
  }, [count])

  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uBurst: { value: 2 },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color('#f4f4f5') },
      uColorB: { value: new THREE.Color('#7c5cff') },
    }),
    [],
  )

  useFrame((_state, delta) => {
    const material = materialRef.current
    if (!material) return
    const current = material.uniforms
    current.uTime.value += delta
    current.uPointer.value.lerp(pointerRef.current, 0.1)
    current.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 1.75)

    const hero = document.getElementById('andy')
    if (hero) {
      const range = Math.max(1, hero.offsetHeight - window.innerHeight)
      current.uProgress.value = THREE.MathUtils.clamp(window.scrollY / range, 0, 1)
    }

    const startedAt = burstRef.current
    current.uBurst.value = startedAt ? Math.min(1, (performance.now() - startedAt) / 850) : 2
  })

  return (
    <points geometry={geometry} scale={[viewport.width / 2, viewport.height / 2, 1]}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={PARTICLE_VERTEX}
        fragmentShader={PARTICLE_FRAGMENT}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function HeroScene({ videoSrc, poster, className = '', onFail }) {
  const reducedMotion = useReducedMotion()
  const wrapRef = useRef(null)
  const pointerRef = useRef(new THREE.Vector2(0, 0))
  const burstRef = useRef(0)
  const [webglOk] = useState(supportsWebGL)
  const [texture, setTexture] = useState(null)
  const [active, setActive] = useState(true)
  const onFailRef = useRef(onFail)
  onFailRef.current = onFail

  // 视频 → 纹理；失败时退回海报纹理，纹理准备好再交给场景
  useEffect(() => {
    if (reducedMotion || !webglOk) return undefined
    let disposed = false
    let videoTexture = null
    let posterTexture = null

    const video = document.createElement('video')
    video.src = videoSrc
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'auto'
    video.setAttribute('aria-hidden', 'true')
    video.style.cssText =
      'position:fixed;left:-20px;top:-20px;width:2px;height:2px;opacity:0;pointer-events:none'

    const applyPosterTexture = () => {
      if (disposed || posterTexture) return
      posterTexture = new THREE.TextureLoader().load(poster, loaded => {
        if (!disposed) setTexture(loaded)
      })
    }

    const onReady = () => {
      if (disposed || videoTexture) return
      videoTexture = new THREE.VideoTexture(video)
      videoTexture.colorSpace = THREE.SRGBColorSpace
      videoTexture.minFilter = THREE.LinearFilter
      videoTexture.magFilter = THREE.LinearFilter
      setTexture(videoTexture)
      if (posterTexture) {
        posterTexture.dispose()
        posterTexture = null
      }
    }
    const onError = () => {
      videoTexture?.dispose()
      videoTexture = null
      applyPosterTexture()
    }

    video.addEventListener('loadeddata', onReady)
    video.addEventListener('error', onError)
    document.body.appendChild(video)
    // 先铺海报，视频首个关键帧到达后再无感切换
    applyPosterTexture()
    video.play().catch(() => {})

    return () => {
      disposed = true
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('error', onError)
      video.pause()
      video.removeAttribute('src')
      video.load()
      video.remove()
      videoTexture?.dispose()
      posterTexture?.dispose()
    }
  }, [videoSrc, poster, reducedMotion, webglOk])

  // WebGL / 减少动画不可用时放行给原生视频
  useEffect(() => {
    if (reducedMotion || !webglOk) onFailRef.current?.()
  }, [reducedMotion, webglOk])

  // 指针与点击（window 级，canvas 本身 pointer-events: none）
  useEffect(() => {
    if (reducedMotion || !webglOk) return undefined
    const onPointerMove = event => {
      pointerRef.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      )
    }
    const onPointerDown = () => {
      burstRef.current = performance.now()
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [reducedMotion, webglOk])

  // 离开视口或切到后台时停帧，省电也省风扇
  useEffect(() => {
    if (reducedMotion || !webglOk) return undefined
    const node = wrapRef.current
    if (!node) return undefined
    let inView = true
    const sync = () => setActive(inView && !document.hidden)
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        sync()
      },
      { threshold: 0.05 },
    )
    observer.observe(node)
    document.addEventListener('visibilitychange', sync)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [reducedMotion, webglOk])

  if (reducedMotion || !webglOk) return null

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 45, position: [0, 0, 6], near: 0.1, far: 20 }}
        onCreated={({ gl }) => gl.setClearColor('#07031a')}
      >
        {texture && <VideoPlane texture={texture} pointerRef={pointerRef} />}
        <ParticleField pointerRef={pointerRef} burstRef={burstRef} />
      </Canvas>
    </div>
  )
}
