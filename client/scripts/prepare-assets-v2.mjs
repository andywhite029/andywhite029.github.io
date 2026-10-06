// 新版视觉系统素材准备脚本（阶段一：首屏 / 光轮智能 / 轻舟智航）
// 从 素材/ 原始资料库生成 web 用短片与图片，输出到 public/assets-v2/，
// 并生成 来源记录.json 保证可追溯。
//
// 用法：node scripts/prepare-assets-v2.mjs
// 依赖：ffmpeg（PATH 中）、sharp（devDependencies）

import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../')
const srcRoot = path.join(repoRoot, '素材')
const outRoot = path.join(__dirname, '../public/assets-v2')

/** @type {{output:string,source:string,timeRange?:string,spec:string}[]} */
const records = []

const V = (...args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'pipe', 'inherit'] })

function ensure(dir) {
  mkdirSync(path.join(outRoot, dir), { recursive: true })
}

function video({ output, source, from, duration, width, crf = 27 }) {
  const src = path.join(srcRoot, source)
  const dst = path.join(outRoot, output)
  ensure(path.dirname(output))
  V('-ss', String(from), '-i', src, '-t', String(duration), '-an',
    '-vf', `scale=${width}:-2`, '-c:v', 'libx264', '-preset', 'slow',
    '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst)
  const size = (statSync(dst).size / 1024 / 1024).toFixed(2)
  console.log(`✓ ${output} (${size} MB)`)
  records.push({ output, source: `素材/${source}`, timeRange: `${from}s +${duration}s`, spec: `h264 ${width}w crf${crf} 无音轨` })
}

async function poster({ output, source, at, width }) {
  const src = path.join(srcRoot, source)
  const dst = path.join(outRoot, output)
  ensure(path.dirname(output))
  const frame = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(at), '-i', src, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], { maxBuffer: 64 * 1024 * 1024 })
  await sharp(frame).resize(width, null, { withoutEnlargement: true }).webp({ quality: 78 }).toFile(dst)
  const size = (statSync(dst).size / 1024).toFixed(0)
  console.log(`✓ ${output} (${size} KB)`)
  records.push({ output, source: `素材/${source}`, timeRange: `抽帧 ${at}s`, spec: `webp ${width}w q78` })
}

async function image({ output, source, width, quality = 78, format = 'webp' }) {
  const src = path.join(srcRoot, source)
  const dst = path.join(outRoot, output)
  ensure(path.dirname(output))
  await sharp(src).resize(width, null, { withoutEnlargement: true })[format](format === 'webp' ? { quality } : { compressionLevel: 9 }).toFile(dst)
  const size = (statSync(dst).size / 1024).toFixed(0)
  const meta = await sharp(dst).metadata()
  console.log(`✓ ${output} (${size} KB, ${meta.width}x${meta.height})`)
  records.push({ output, source: `素材/${source}`, spec: `${format} ${width}w${format === 'webp' ? ` q${quality}` : ''}` })
}

function copy({ output, source }) {
  const src = path.join(srcRoot, source)
  const dst = path.join(outRoot, output)
  ensure(path.dirname(output))
  copyFileSync(src, dst)
  console.log(`✓ ${output} (copy)`)
  records.push({ output, source: `素材/${source}`, spec: '原样复制' })
}

// ---------- 视频片段（选段依据见 docs/网站全新设计方案.md 与阶段一抽帧记录） ----------
// 首屏：RoboStack 真人示教场景（3.2-8.6s，人物清晰、字幕稀疏）
video({ output: 'hero/andy-opening.mp4', source: '01-光轮智能/RoboStack/RoboStack成都.mp4', from: 3.2, duration: 5.4, width: 1280, crf: 26 })
// 光轮舞台画面一：仿真/真实双机器人对照（82.4-88.4s）
video({ output: 'guanglun/robostack-stage.mp4', source: '01-光轮智能/RoboStack/RoboStack成都.mp4', from: 82.4, duration: 6.0, width: 1600 })
// 光轮舞台画面二：持续学习 仿真厨房→真实厨房（75.8-86s）
video({ output: 'guanglun/continuous-learning.mp4', source: '01-光轮智能/持续学习系统/持续学习final.mp4', from: 75.8, duration: 10.2, width: 1600 })
// WRC 开源数据集发布视频节选（29.4-37.4s，"100,000 小时"马赛克段，点击播放）
video({ output: 'guanglun/wrc-dataset.mp4', source: '01-光轮智能/WRC2026/开源数据集发布视频.mp4', from: 29.4, duration: 8.0, width: 1280 })

// ---------- 视频封面 ----------
await poster({ output: 'hero/andy-opening-poster.webp', source: '01-光轮智能/RoboStack/RoboStack成都.mp4', at: 5.4, width: 1280 })
await poster({ output: 'guanglun/robostack-stage-poster.webp', source: '01-光轮智能/RoboStack/RoboStack成都.mp4', at: 85.2, width: 1600 })
await poster({ output: 'guanglun/continuous-learning-poster.webp', source: '01-光轮智能/持续学习系统/持续学习final.mp4', at: 82.5, width: 1600 })
await poster({ output: 'guanglun/wrc-dataset-poster.webp', source: '01-光轮智能/WRC2026/开源数据集发布视频.mp4', at: 33.5, width: 1280 })

// ---------- 轻舟官网真实素材（来自 qcraft-web 仓库精选，见 素材/02-轻舟智航/官网项目/仓库素材清单.json） ----------
await image({ output: 'qcraft/hero-road-1920.webp', source: '02-轻舟智航/官网项目/仓库精选素材/home/hero-web.jpg', width: 1920 })
await image({ output: 'qcraft/hero-road-1080.webp', source: '02-轻舟智航/官网项目/仓库精选素材/home/hero-web.jpg', width: 1080 })
await image({ output: 'qcraft/tech-overview-1200.webp', source: '02-轻舟智航/官网项目/仓库精选素材/home/tech-overview.jpg', width: 1200 })
await image({ output: 'qcraft/ai-architecture-1200.webp', source: '02-轻舟智航/官网项目/仓库精选素材/tech/ai-architecture.jpg', width: 1200 })

// ---------- 品牌 Logo（保持原比例、原色、透明通道） ----------
await image({ output: 'brands/qcraft-logo.png', source: '02-轻舟智航/品牌资料/QCRAFT LOGO-主要标志-原色.png', width: 1400, format: 'png' })
await image({ output: 'brands/qcraft-logo-white.png', source: '02-轻舟智航/品牌资料/QCRAFT LOGO-主要标志-白色.png', width: 1400, format: 'png' })
copy({ output: 'brands/guanglun-logo.png', source: '01-光轮智能/品牌资料/Guanglun_Primary_Horizontal_FullColor_Light_RGB_01.png' })
copy({ output: 'brands/momenta.png', source: '03-Momenta/品牌资料/momenta-logo-header-official.png' })
copy({ output: 'brands/zeekr-wordmark.png', source: '04-极氪/品牌资料/zeekr-wordmark-official.png' })
copy({ output: 'brands/xiaomi.png', source: '05-小米之家/品牌资料/xiaomi-logo-official-static.png' })

// ---------- 来源记录 ----------
mkdirSync(outRoot, { recursive: true })
writeFileSync(
  path.join(outRoot, '来源记录.json'),
  JSON.stringify({ generated: '阶段一（首屏/光轮/轻舟）', items: records }, null, 2),
  'utf-8',
)
console.log(`\n来源记录.json 已写入，共 ${records.length} 条`)
