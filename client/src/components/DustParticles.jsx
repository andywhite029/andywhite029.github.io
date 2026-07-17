import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 1000

const vertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float speed;
  varying vec3 vColor;
  varying float vSpeed;
  varying float vTwinkle;
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uWarp;
  uniform vec2 uMouse;

  void main() {
    vColor = color;
    vSpeed = speed;

    vec3 pos = position;
    // 缓慢漂浮
    pos.y += sin(uTime * speed * 0.3 + position.x * 2.0) * 0.5;
    pos.x += cos(uTime * speed * 0.2 + position.y * 1.5) * 0.3;

    // 转场空间扭曲：粒子向中心收缩并拉伸
    float warpFactor = uWarp;
    vec3 center = vec3(0.0);
    vec3 dir = pos - center;
    float dist = length(dir);
    if (dist > 0.0) {
      dir /= dist;
      // 向中心吸 + 沿视线方向拉伸
      pos = center + dir * (dist * (1.0 - warpFactor * 0.4));
      pos.z += warpFactor * 3.0 * sin(dist * 0.5 + uTime * 2.0);
    }

    // 轻微鼠标视差
    pos.x += uMouse.x * 0.02 * (1.0 + position.z * 0.1);
    pos.y += uMouse.y * 0.02 * (1.0 + position.z * 0.1);

    // 计算鼠标距离（屏幕空间），靠近时闪烁
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vec4 clipPosition = projectionMatrix * mvPosition;
    vec2 screenPos = (clipPosition.xy / clipPosition.w + 1.0) * 0.5;
    float mouseDist = distance(screenPos, uMouse);
    vTwinkle = smoothstep(0.25, 0.0, mouseDist);

    gl_PointSize = size * (80.0 / -mvPosition.z) * (1.0 + uWarp * 0.3) * (1.0 + vTwinkle * 0.8);
    gl_Position = clipPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  varying float vSpeed;
  varying float vTwinkle;
  uniform float uTime;
  uniform float uScrollProgress;

  void main() {
    // 圆形粒子
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // 呼吸闪烁
    float flicker = 0.5 + 0.5 * sin(uTime * vSpeed * 2.0);
    float alpha = smoothstep(0.5, 0.0, dist) * (0.3 + 0.7 * flicker);

    // 根据滚动进度调整颜色：暗房红 -> 终端绿
    vec3 terminalGreen = vec3(0.0, 1.0, 0.25);
    vec3 finalColor = mix(vColor, terminalGreen, smoothstep(0.4, 0.6, uScrollProgress));

    // 终端区增加亮度脉冲
    if (uScrollProgress > 0.5) {
      float pulse = 0.8 + 0.2 * sin(uTime * 8.0 + vSpeed * 10.0);
      finalColor *= pulse;
    }

    // 鼠标靠近时的眨眼效果
    if (vTwinkle > 0.01) {
      float blink = sin(uTime * 12.0 + vSpeed * 30.0) * 0.5 + 0.5;
      blink = pow(blink, 3.0); // 更尖锐的闪烁
      finalColor *= (1.0 + vTwinkle * blink * 3.0);
      alpha *= (1.0 + vTwinkle * blink * 2.0);
    }

    gl_FragColor = vec4(finalColor, alpha * 0.4);
  }
`

export default function DustParticles({ scrollProgress = 0 }) {
  const pointsRef = useRef()
  const materialRef = useRef()

  const { positions, colors, sizes, speeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const speeds = new Float32Array(PARTICLE_COUNT)

    const redPalette = [
      new THREE.Color('#cc1100'),
      new THREE.Color('#ff2200'),
      new THREE.Color('#ff6644'),
      new THREE.Color('#aa4433'),
    ]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 分布在相机前方的空间
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5

      // 大部分红色系，少量白色/绿色
      const color = redPalette[Math.floor(Math.random() * redPalette.length)]
      if (Math.random() > 0.85) {
        color.setRGB(0.9, 0.8, 0.7) // 米白
      }
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = Math.random() * 0.6 + 0.1
      speeds[i] = Math.random() * 2 + 0.5
    }

    return { positions, colors, sizes, speeds }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uWarp: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  )

  useFrame((state) => {
    if (!materialRef.current) return

    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    materialRef.current.uniforms.uScrollProgress.value = scrollProgress

    // 转场扭曲：在滚动进度 0.45-0.65 之间最强
    const warpStart = 0.45
    const warpEnd = 0.65
    let warp = 0
    if (scrollProgress > warpStart && scrollProgress < warpEnd) {
      const mid = (warpStart + warpEnd) / 2
      const halfRange = (warpEnd - warpStart) / 2
      warp = 1 - Math.abs(scrollProgress - mid) / halfRange
    }
    materialRef.current.uniforms.uWarp.value = warp

    // 鼠标位置转换到 0-1 屏幕空间（y 向上）
    const mouseX = (state.pointer.x + 1) / 2
    const mouseY = (state.pointer.y + 1) / 2
    materialRef.current.uniforms.uMouse.value.set(mouseX, mouseY)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-speed" count={PARTICLE_COUNT} array={speeds} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
