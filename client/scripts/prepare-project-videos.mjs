// 完整代表项目视频：保留原始时长和音轨，独立于背景循环片段。
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = new URL('../../', import.meta.url)
const output = new URL('../public/assets-v2/', import.meta.url)
const manifestUrl = new URL('来源记录.json', output)
const manifest = JSON.parse(readFileSync(manifestUrl, 'utf8'))
const projects = [
  ['robostack-full', '素材/01-光轮智能/RoboStack/RoboStack成都.mp4'],
  ['continuous-learning-full', '素材/01-光轮智能/持续学习系统/持续学习final.mp4'],
  ['wrc-dataset-full', '素材/01-光轮智能/WRC2026/开源数据集发布视频.mp4'],
]

mkdirSync(new URL('guanglun/', output), { recursive: true })
for (const [name, source] of projects) {
  const file = `guanglun/${name}.mp4`
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-i', fileURLToPath(new URL(source, root)),
    '-map', '0:v:0', '-map', '0:a:0?',
    '-vf', "scale='min(1920,iw)':-2", '-c:v', 'libx264', '-preset', 'fast',
    '-crf', '25', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart', fileURLToPath(new URL(file, output)),
  ], { stdio: 'inherit' })
  manifest.items = manifest.items.filter(item => item.output !== file)
  manifest.items.push({ output: file, source, timeRange: 'Full duration', spec: 'H.264 up to 1920w CRF25, AAC 128k original audio, faststart' })
  console.log(`Prepared ${file}`)
}
writeFileSync(manifestUrl, JSON.stringify(manifest, null, 2) + '\n')
