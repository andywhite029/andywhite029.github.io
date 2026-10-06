import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'

const root = new URL('../../', import.meta.url)
const output = new URL('../public/assets-v2/', import.meta.url)
const manifestUrl = new URL('来源记录.json', output)
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'))
const images = [
  ['momenta/hero', '素材/03-Momenta/官网素材/mpilot-desktop.jpg'],
  ['zeekr/hero', '素材/04-极氪/官网素材/zeekr-001.jpg'],
  ['xiaomi/hero', '素材/05-小米之家/官网素材/xiaomi-15-hero.webp'],
  ['xiaomi/devices', '素材/05-小米之家/官网素材/xiaomi-personal-devices.jpg'],
  ['xiaomi/home', '素材/05-小米之家/官网素材/xiaomi-smart-home.jpg'],
  ['momenta/wicv', 'client/public/photos/momenta-wicv.webp'],
]
for (const [name, source] of images) {
  await mkdir(new URL(name.split('/')[0] + '/', output), { recursive: true })
  for (const width of [800, 1600]) {
    const file = `${name}-${width}.webp`
    await sharp(fileURLToPath(new URL(source, root))).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(fileURLToPath(new URL(file, output)))
    manifest.items = manifest.items.filter(item => item.output !== file)
    manifest.items.push({ output: file, source, spec: `webp max ${width}w q80` })
  }
}
await mkdir(new URL('photography/', output), { recursive: true })
for (const id of ['000038', '000044', '000016', '000053', '000057', '000062']) {
  const file = `photography/${id}.webp`
  const source = `client/public/photos/${id}.webp`
  await copyFile(new URL(source, root), new URL(file, output))
  manifest.items = manifest.items.filter(item => item.output !== file)
  manifest.items.push({ output: file, source, spec: 'Original webp; no enlargement' })
}
manifest.generated = '阶段一 + 阶段二'
await writeFile(manifestUrl, JSON.stringify(manifest, null, 2) + '\n')
console.log('Phase two assets ready:', images.length * 2 + 6)
