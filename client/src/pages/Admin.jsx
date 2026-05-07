import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Edit2, Trash2, Save, X, LogOut, Lock } from 'lucide-react'

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001'
  : '/api'

// 带鉴权的 fetch 封装
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('admin_token')
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

function GlassCard({ children, className = '' }) {
  return (
    <div className={`bg-bg-primary/70 backdrop-blur-md rounded-3xl shadow-lg border border-border/50 ${className}`}>
      {children}
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-bg-primary rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function NovelForm({ novel, onSave, onCancel }) {
  const [form, setForm] = useState(novel || { name: '', author: 'Andy', description: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h3 className="text-xl font-bold mb-6">{novel ? '编辑小说' : '新建小说'}</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">小说名称</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 bg-bg-secondary rounded-xl border border-border focus:border-accent focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">作者</label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="w-full px-4 py-3 bg-bg-secondary rounded-xl border border-border focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">简介</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 bg-bg-secondary rounded-xl border border-border focus:border-accent focus:outline-none resize-none h-24"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 py-3 bg-accent text-white rounded-xl flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors"
        >
          <Save size={18} />
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-bg-secondary rounded-xl hover:bg-border transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  )
}

function ChapterForm({ chapter, onSave, onCancel }) {
  const [form, setForm] = useState(chapter || { number: '', title: '', content: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h3 className="text-xl font-bold mb-6">{chapter ? '编辑章节' : '新建章节'}</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">章节号</label>
          <input
            type="text"
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            className="w-full px-4 py-3 bg-bg-secondary rounded-xl border border-border focus:border-accent focus:outline-none"
            placeholder="1, 2, 3..."
            required
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">章节标题</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 bg-bg-secondary rounded-xl border border-border focus:border-accent focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">正文</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-4 py-3 bg-bg-secondary rounded-xl border border-border focus:border-accent focus:outline-none resize-none h-64 font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 py-3 bg-accent text-white rounded-xl flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors"
        >
          <Save size={18} />
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-bg-secondary rounded-xl hover:bg-border transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  )
}

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        throw new Error('密码错误')
      }
      const data = await res.json()
      localStorage.setItem('admin_token', data.token)
      onLogin(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <GlassCard className="w-full max-w-sm p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-accent/10 rounded-full">
            <Lock className="text-accent" size={28} />
          </div>
        </div>
        <h2 className="text-xl font-bold text-center mb-2">管理员登录</h2>
        <p className="text-sm text-text-secondary text-center mb-6">请输入密码进入管理后台</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            className="w-full px-4 py-3 bg-bg-secondary rounded-xl border border-border focus:border-accent focus:outline-none"
            required
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </GlassCard>
    </div>
  )
}

export default function Admin() {
  const [novels, setNovels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedNovel, setSelectedNovel] = useState(null)
  const [showNovelModal, setShowNovelModal] = useState(false)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [editingChapter, setEditingChapter] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))

  const isLoggedIn = !!token

  const fetchNovels = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/novels`)
      const data = await res.json()
      setNovels(data.novels || [])
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchNovels()
    } else {
      setLoading(false)
    }
  }, [isLoggedIn])

  const handleLogin = (newToken) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setNovels([])
    setSelectedNovel(null)
  }

  const handleSaveNovel = async (form) => {
    const res = await apiFetch(`${API_BASE}/novels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || '保存失败')
      return
    }
    setShowNovelModal(false)
    fetchNovels()
  }

  const handleSaveChapter = async (form) => {
    let res
    if (editingChapter) {
      res = await apiFetch(`${API_BASE}/novels/${selectedNovel.id}/chapters/${editingChapter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      res = await apiFetch(`${API_BASE}/novels/${selectedNovel.id}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || '保存失败')
      return
    }
    setShowChapterModal(false)
    setEditingChapter(null)
    fetchNovels()
    // 更新当前选中小说
    const novelRes = await apiFetch(`${API_BASE}/novels/${selectedNovel.id}`)
    const updated = await novelRes.json()
    setSelectedNovel(updated)
  }

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm('确定删除此章节？')) return
    const res = await apiFetch(`${API_BASE}/novels/${selectedNovel.id}/chapters/${chapterId}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || '删除失败')
      return
    }
    fetchNovels()
    // 更新当前选中小说
    const novelRes = await apiFetch(`${API_BASE}/novels/${selectedNovel.id}`)
    const updated = await novelRes.json()
    setSelectedNovel(updated)
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold">小说管理</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNovelModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors"
            >
              <Plus size={18} />
              新建小说
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-text-secondary hover:text-red-500 transition-colors"
              title="退出登录"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 小说列表 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">小说列表</h2>
            {novels.length === 0 ? (
              <GlassCard className="p-6 text-center text-text-secondary">
                暂无小说，点击上方按钮创建
              </GlassCard>
            ) : (
              novels.map((novel) => (
                <GlassCard
                  key={novel.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedNovel?.id === novel.id ? 'ring-2 ring-accent' : ''
                  }`}
                  onClick={() => setSelectedNovel(novel)}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-accent" size={20} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{novel.name}</h3>
                      <p className="text-sm text-text-secondary">{novel.chapters.length} 章</p>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>

          {/* 章节列表 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {selectedNovel ? `${selectedNovel.name} - 章节列表` : '选择左侧小说'}
            </h2>
            {selectedNovel ? (
              <>
                <button
                  onClick={() => {
                    setEditingChapter(null)
                    setShowChapterModal(true)
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-bg-secondary rounded-xl hover:bg-border transition-colors text-text-secondary"
                >
                  <Plus size={18} />
                  添加章节
                </button>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {selectedNovel.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="p-3 bg-bg-secondary rounded-xl flex items-center justify-between group"
                    >
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                        setEditingChapter(chapter)
                        setShowChapterModal(true)
                      }}>
                        <span className="text-sm text-accent">第{chapter.number}章</span>
                        <span className="ml-2 truncate">{chapter.title}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <GlassCard className="p-6 text-center text-text-secondary">
                选择左侧小说查看章节
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* 小说弹窗 */}
      {showNovelModal && (
        <Modal onClose={() => setShowNovelModal(false)}>
          <NovelForm
            onSave={handleSaveNovel}
            onCancel={() => setShowNovelModal(false)}
          />
        </Modal>
      )}

      {/* 章节弹窗 */}
      {showChapterModal && (
        <Modal onClose={() => {
          setShowChapterModal(false)
          setEditingChapter(null)
        }}>
          <ChapterForm
            chapter={editingChapter}
            onSave={handleSaveChapter}
            onCancel={() => {
              setShowChapterModal(false)
              setEditingChapter(null)
            }}
          />
        </Modal>
      )}
    </div>
  )
}
