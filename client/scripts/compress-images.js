import sharp from 'sharp'
import { readdir, readFile, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const photosDir = path.join(__dirname, '../public/photos')
const maxWidth = 800
const quality = 75

async function compressImages() {
  if (!existsSync(photosDir)) {
    console.log('No photos to compress')
    return
  }

  const files = await readdir(photosDir)
  const images = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f))

  console.log(`Compressing ${images.length} images...`)

  for (const file of images) {
    const srcPath = path.join(photosDir, file)
    const webpPath = srcPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')

    try {
      const originalSize = (await readFile(srcPath)).length

      await sharp(srcPath)
        .resize(maxWidth, null, { withoutEnlargement: true })
        .webp({ quality })
        .toFile(webpPath)

      const compressedSize = (await readFile(webpPath)).length
      const saved = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
      console.log(`✓ ${file} -> ${path.basename(webpPath)} (saved ${saved}%)`)

      // Remove original after successful conversion
      await unlink(srcPath)
    } catch (err) {
      console.error(`✗ Failed to compress ${file}:`, err.message)
    }
  }

  console.log('Done!')
}

compressImages()