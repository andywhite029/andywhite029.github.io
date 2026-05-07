import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'andy029'

// 存储已登录的 token（内存级，服务重启后失效）
const sessions = new Set()

// 根据环境配置 CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://andywhite029.github.io']
    : true,
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())

const DATA_FILE = path.join(__dirname, 'data', 'novels.json')

// 简单的文件锁，防止并发写入导致数据丢失
let isWriting = false
const writeQueue = []

function withLock(fn) {
  return new Promise((resolve, reject) => {
    const task = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    writeQueue.push(task)
    processQueue()
  })
}

async function processQueue() {
  if (isWriting || writeQueue.length === 0) return
  isWriting = true
  const task = writeQueue.shift()
  await task()
  isWriting = false
  processQueue()
}

// 读取小说数据
function readNovels() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { novels: [] }
  }
}

// 保存小说数据（带锁）
function saveNovels(data) {
  return withLock(() => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  })
}

// 管理员登录
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密码错误' })
  }
  const token = crypto.randomBytes(32).toString('hex')
  sessions.add(token)
  res.json({ token })
})

// 鉴权中间件
function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' })
  }
  const token = auth.slice(7)
  if (!sessions.has(token)) {
    return res.status(401).json({ error: '登录已过期' })
  }
  next()
}

// 获取所有小说
app.get('/api/novels', (req, res) => {
  const data = readNovels()
  res.json(data)
})

// 获取单本小说
app.get('/api/novels/:id', (req, res) => {
  const data = readNovels()
  const novel = data.novels.find(n => n.id === req.params.id)
  if (!novel) {
    return res.status(404).json({ error: '小说不存在' })
  }
  res.json(novel)
})

// 创建小说
app.post('/api/novels', requireAuth, async (req, res) => {
  const { name, author, description } = req.body

  if (!name) {
    return res.status(400).json({ error: '请提供小说名称' })
  }

  const data = readNovels()

  // 生成 ID
  const id = name.toLowerCase().replace(/\s+/g, '-')

  // 检查是否已存在
  if (data.novels.find(n => n.id === id)) {
    return res.status(400).json({ error: '小说已存在' })
  }

  const novel = {
    id,
    name,
    author: author || 'Andy',
    description: description || '',
    chapters: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  data.novels.push(novel)
  await saveNovels(data)

  res.status(201).json(novel)
})

// 创建章节
app.post('/api/novels/:id/chapters', requireAuth, async (req, res) => {
  const { number, title, content } = req.body

  if (!number || !title) {
    return res.status(400).json({ error: '请提供章节号和标题' })
  }

  const data = readNovels()
  const novel = data.novels.find(n => n.id === req.params.id)

  if (!novel) {
    return res.status(404).json({ error: '小说不存在' })
  }

  const chapter = {
    id: Date.now(),
    number: String(number),
    title,
    content: content || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  novel.chapters.push(chapter)
  novel.updatedAt = new Date().toISOString()
  await saveNovels(data)

  res.status(201).json(chapter)
})

// 更新章节
app.put('/api/novels/:novelId/chapters/:chapterId', requireAuth, async (req, res) => {
  const { title, content } = req.body

  const data = readNovels()
  const novel = data.novels.find(n => n.id === req.params.novelId)

  if (!novel) {
    return res.status(404).json({ error: '小说不存在' })
  }

  const chapter = novel.chapters.find(c => c.id === Number(req.params.chapterId))

  if (!chapter) {
    return res.status(404).json({ error: '章节不存在' })
  }

  if (title) chapter.title = title
  if (content !== undefined) chapter.content = content
  chapter.updatedAt = new Date().toISOString()
  novel.updatedAt = new Date().toISOString()

  await saveNovels(data)

  res.json(chapter)
})

// 删除章节
app.delete('/api/novels/:novelId/chapters/:chapterId', requireAuth, async (req, res) => {
  const data = readNovels()
  const novel = data.novels.find(n => n.id === req.params.novelId)

  if (!novel) {
    return res.status(404).json({ error: '小说不存在' })
  }

  const chapterIndex = novel.chapters.findIndex(c => c.id === Number(req.params.chapterId))

  if (chapterIndex === -1) {
    return res.status(404).json({ error: '章节不存在' })
  }

  novel.chapters.splice(chapterIndex, 1)
  novel.updatedAt = new Date().toISOString()

  await saveNovels(data)

  res.status(204).send()
})

app.listen(PORT, () => {
  console.log(`小说 API 服务运行在 http://localhost:${PORT}`)
})
