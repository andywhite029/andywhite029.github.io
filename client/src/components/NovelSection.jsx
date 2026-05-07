import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronRight, X, ArrowLeft } from 'lucide-react'
import { useNovels } from '../hooks/useNovels'

function GlassCard({ children, className = '' }) {
  return (
    <div className={`bg-bg-primary/70 backdrop-blur-md rounded-3xl shadow-lg border border-border/50 gradient-border ${className}`}>
      {children}
    </div>
  )
}

function NovelCard({ novel, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={() => onSelect(novel)}
    >
      <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/30 to-purple-500/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-accent" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-text-primary mb-1 truncate">
              {novel.name}
            </h3>
            <p className="text-sm text-text-secondary mb-2 line-clamp-2">
              {novel.description || '暂无简介'}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span>作者: {novel.author}</span>
              <span>·</span>
              <span>{novel.chapters.length} 章</span>
            </div>
          </div>
          <ChevronRight className="text-text-secondary flex-shrink-0" size={20} />
        </div>
      </GlassCard>
    </motion.div>
  )
}

function ChapterList({ novel, onBack, onSelectChapter }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        <span>返回目录</span>
      </button>

      <h3 className="text-2xl font-bold text-text-primary mb-6">{novel.name}</h3>
      {novel.description && (
        <p className="text-text-secondary mb-6">{novel.description}</p>
      )}

      <div className="space-y-2">
        {novel.chapters.map((chapter, index) => (
          <motion.button
            key={chapter.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectChapter(chapter)}
            className="w-full text-left px-4 py-3 rounded-xl bg-bg-secondary hover:bg-border transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-accent font-medium">
                  第{chapter.number}章
                </span>
                <span className="ml-2 text-text-primary group-hover:text-accent transition-colors">
                  {chapter.title}
                </span>
              </div>
              <ChevronRight className="text-text-secondary group-hover:text-accent transition-colors" size={16} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function ChapterReader({ chapter, onBack }) {
  // 简单解析章节内容，第一行作为标题，其余作为正文
  const lines = (chapter.content || '').split('\n')
  const title = lines.find(l => !l.startsWith('#') && !l.startsWith('作者:') && !l.startsWith('简介:')) || chapter.title
  const content = lines.filter(l => l.trim() && !l.startsWith('#')).slice(1).join('\n')

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        <span>返回章节列表</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          第{chapter.number}章 · {chapter.title}
        </h2>
        <p className="text-sm text-text-secondary mb-8">
          更新于 {new Date(chapter.updatedAt).toLocaleDateString('zh-CN')}
        </p>

        <GlassCard className="p-8 md:p-12">
          <div className="prose prose-stone max-w-none text-text-primary leading-relaxed whitespace-pre-wrap">
            {content || '内容加载中...'}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default function NovelSection() {
  const { novels, loading, error } = useNovels()
  const [selectedNovel, setSelectedNovel] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)

  if (loading) {
    return (
      <section id="novels" className="py-24">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto text-center">
            <GlassCard className="p-12">
              <p className="text-text-secondary">加载中...</p>
            </GlassCard>
          </div>
        </div>
      </section>
    )
  }

  if (error || novels.length === 0) {
    return null
  }

  return (
    <section id="novels" className="py-24">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto"
        >
          <GlassCard className="p-8 md:p-12 mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-4">
              连载小说
            </h2>
            <p className="text-text-secondary text-lg">
              用文字构建的世界。
            </p>
          </GlassCard>

          <AnimatePresence mode="wait">
            {selectedChapter ? (
              <motion.div
                key="reader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ChapterReader
                  chapter={selectedChapter}
                  onBack={() => setSelectedChapter(null)}
                />
              </motion.div>
            ) : selectedNovel ? (
              <motion.div
                key="chapters"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ChapterList
                  novel={selectedNovel}
                  onBack={() => setSelectedNovel(null)}
                  onSelectChapter={setSelectedChapter}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {novels.map((novel) => (
                  <NovelCard
                    key={novel.id}
                    novel={novel}
                    onSelect={setSelectedNovel}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
